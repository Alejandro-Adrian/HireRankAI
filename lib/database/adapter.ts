import { query, execute } from "./mssql"
import { v4 as uuidv4 } from "uuid"

// User operations
export const userOperations = {
  async findByEmail(email: string) {
    const result = await query("SELECT * FROM users WHERE email = @param0", [email])
    return result[0] || null
  },

  async create(userData: {
    email: string
    password_hash: string
    firstname?: string
    lastname?: string
    company_name?: string
    verification_code?: string
    verification_expires_at?: Date
  }) {
    const id = uuidv4()
    await execute(
      `
      INSERT INTO users (id, email, password_hash, firstname, lastname, company_name, verification_code, verification_expires_at)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7)
    `,
      [
        id,
        userData.email,
        userData.password_hash,
        userData.firstname || null,
        userData.lastname || null,
        userData.company_name || null,
        userData.verification_code || null,
        userData.verification_expires_at || null,
      ],
    )
    return { id, ...userData }
  },

  async update(id: string, updates: any) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = @param${index + 1}`)
      .join(", ")

    const values = [id, ...Object.values(updates)]

    await execute(`UPDATE users SET ${setClause}, updated_at = GETDATE() WHERE id = @param0`, values)
  },
}

// Rankings operations
export const rankingOperations = {
  async findById(id: string) {
    const result = await query("SELECT * FROM rankings WHERE id = @param0", [id])
    return result[0] || null
  },

  async findByUserId(userId: string) {
    return await query("SELECT * FROM rankings WHERE created_by = @param0 ORDER BY created_at DESC", [userId])
  },

  async create(rankingData: any) {
    const id = uuidv4()
    await execute(
      `
      INSERT INTO rankings (id, title, position, description, area_city, area_living_preference, 
                           criteria, criteria_weights, show_criteria_to_applicants, 
                           application_link_id, created_by)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10)
    `,
      [
        id,
        rankingData.title,
        rankingData.position,
        rankingData.description || null,
        rankingData.area_city || null,
        rankingData.area_living_preference || null,
        JSON.stringify(rankingData.criteria || {}),
        JSON.stringify(rankingData.criteria_weights || {}),
        rankingData.show_criteria_to_applicants !== false,
        rankingData.application_link_id || null,
        rankingData.created_by,
      ],
    )
    return { id, ...rankingData }
  },

  async update(id: string, updates: any) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = @param${index + 1}`)
      .join(", ")

    const values = [id, ...Object.values(updates)]

    await execute(`UPDATE rankings SET ${setClause}, updated_at = GETDATE() WHERE id = @param0`, values)
  },

  async delete(id: string) {
    await execute("DELETE FROM rankings WHERE id = @param0", [id])
  },
}

// Applications operations
export const applicationOperations = {
  async findByRankingId(rankingId: string) {
    return await query(
      "SELECT * FROM applications WHERE ranking_id = @param0 ORDER BY total_score DESC, submitted_at DESC",
      [rankingId],
    )
  },

  async findById(id: string) {
    const result = await query("SELECT * FROM applications WHERE id = @param0", [id])
    return result[0] || null
  },

  async create(applicationData: any) {
    const id = uuidv4()
    await execute(
      `
      INSERT INTO applications (id, ranking_id, applicant_name, applicant_email, applicant_phone,
                               applicant_city, key_skills, experience_years, education_level,
                               certifications, resume_summary, ocr_transcript)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, @param11)
    `,
      [
        id,
        applicationData.ranking_id,
        applicationData.applicant_name,
        applicationData.applicant_email,
        applicationData.applicant_phone || null,
        applicationData.applicant_city || null,
        applicationData.key_skills || null,
        applicationData.experience_years || 0,
        applicationData.education_level || null,
        applicationData.certifications || null,
        applicationData.resume_summary || null,
        applicationData.ocr_transcript || null,
      ],
    )
    return { id, ...applicationData }
  },

  async update(id: string, updates: any) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = @param${index + 1}`)
      .join(", ")

    const values = [id, ...Object.values(updates)]

    await execute(`UPDATE applications SET ${setClause} WHERE id = @param0`, values)
  },

  async delete(id: string) {
    await execute("DELETE FROM applications WHERE id = @param0", [id])
  },
}
