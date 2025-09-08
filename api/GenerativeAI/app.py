import asyncio
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import gc
import time
import os

rubric_txt = """Resume Screening Rubric (Total Score: 100 points)
Part 1: Foundational Criteria (Maximum 30 Points)
This section applies to all applicants (Barista, Cashier, Waiter).

Criteria
Scoring Guideline
Max Points
Resume Professionalism
1–5: Multiple errors, poor formatting. 
6–8: Minor errors, generally clear. 
9–10: Clean, well-formatted, no typos.
10
Work Availability
1–5: Limited availability, conflicts with needs. 
6–8: Some flexibility. 
9–10: Open/flexible, includes weekends/holidays.
10
Job Stability
1–5: Very short tenures (<4 months). 
6–8: 6 months – 1 year tenure. 
9–10: 1+ year tenure, shows stability.
10


Part 2: Role-Specific Experience & Skills (Maximum 50 Points)
Use the appropriate section below based on the position the candidate applied for.

Criteria
Scoring Guideline
Max Points
Direct Barista Experience
1–10: None. 
11–15: 6 mo – 1 yr. 
16–20: 1–2 yrs. 
21–25: 2+ yrs.
25
Coffee Knowledge & Technical Skill
1–5: None mentioned. 
6–10: Basic drink prep, espresso machine. 11–15: Latte art, calibration, brewing methods.
15
POS & Cash Handling
1–5: None. 
6–8: Some experience. 
9–10: Proficient with POS + cash handling.
10


B) For the CASHIER Applicant
 Mandatory Requirement: Must be a High School Graduate. If 'No', disqualify the application regardless of score.

Criteria
Scoring Guideline
Max Points
Cash Handling & POS Experience
1–10: None. 
11–15: Some cash experience. 
16–20: 1–2 yrs POS experience. 
21–25: 2+ yrs multi-POS + reconciliation.
25
Accuracy & Attention to Detail
1–5: None. 
6–10: Some relevant tasks, neat resume. 
11–15: Explicit skills (inventory, reconciliation), flawless resume.
15
Up-selling & Product Knowledge
1–5: None. 
6–8: Retail experience. 
9–10: Proven sales achievements.
10


C) For the WAITER / FOOD SERVER Applicant

Criteria
Scoring Guideline
Max Points
Direct Waiting Experience
1–10: None (only fast-food). 
11–15: 6 mo – 1 yr casual dining. 
16–20: 1–2 yrs casual/fine dining. 
21–25: 2+ yrs high-volume/fine dining.
25
Service & Menu Knowledge
1–5: None. 
6–10: Order-taking, basic service. 
11–15: Complex menus, specials, pairings.
15
Order Taking & POS Proficiency
1–5: None. 
6–8: Manual order experience. 
9–10: Proficient in POS systems (Toast, Micros, Square).
10


Part 3: Transferable & Soft Skills (Max 20 Points)

Criteria
Scoring Guideline
Max Points
Customer Service Orientation
1–4: Generic mention. 
5–7: Specific duties (greeting, answering questions). 
8–10: Proven achievements (improved satisfaction, complaint handling).
10
Teamwork & Communication
1–2: None.
3–4: Generic mention. 
5: Specific teamwork examples (coordination, training).
5
Certifications / Bonus Skills
1–2: None. 
3–5: Relevant certs (Food Handler, First Aid) or extra skill (e.g., another language).
5
"""

rules_txt = (
    "1. Only output one JSON object, nothing else. "
    "2. Do not include explanation outside the JSON. "
    "3. Do not repeat the format. "
    "4. Cashier requires at least High School Graduate. "
    "5. Reject if the info is suspicious and explain why in the summary."
)

format_txt = """{
    "grade": "A-F",
    "suggested_position": "Barista | Cashier | Waiter | Reject",
    "reason": "Explain why you gave this grade and mention any suspicious or missing info",
    "summary": "1-2 sentence summary of the applicant"
}"""

role_txt = (
    "You are an AI Resume Screener (Barista, Cashier if High School Graduate, Waiter). "
    "You will receive unstructured OCR text from resumes. "
    "Your task: analyze the resume and return exactly ONE JSON object in this format:"
)


model_path = r"C:\Users\MJAY\Documents\Website\API\api\GenerativeAI\LLM"

if not os.path.isdir(model_path):
    raise ValueError(f"Model path does not exist: {model_path}")

def AI(prompt: str) -> str:
    tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float16,
        local_files_only=True
    ).to("cuda")

    prompt = f"Human: {prompt}\nAI:"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)
    inputs = {k: v.to("cuda") for k, v in inputs.items()}

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=200,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.pad_token_id
        )

    reply = tokenizer.decode(output[0], skip_special_tokens=True)

    del inputs, output
    torch.cuda.empty_cache()
    gc.collect()
    time.sleep(1)

    return "\n" + reply.split("AI:")[-1].strip()

def TestAI(prompt: str) -> str:
    return "This is a test response for: " + prompt + " (This is a Test Function for AI Interface, adjust it later on)"

async def AI_Interface(prompt: str, mode: str, *,rules = rules_txt, output_format = format_txt, role = role_txt, rubrics= rubric_txt) -> str:
    # You can even use `await asyncio.to_thread(...)` if you call a heavy function
    if (mode == "grader"):
        final_prompt=f"""Role: {role}, 
        Rubrics: {rubrics}, 
        Format: {output_format}, 
        Rules: {rules}, 
        Resume: {prompt}"""
        return await asyncio.to_thread(AI, final_prompt)
    else:
        return await asyncio.to_thread(AI, prompt)
