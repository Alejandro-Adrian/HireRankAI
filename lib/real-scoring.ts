export const realScoring = {
  scoreApplication(application: any, criteriaWeights: any = {}) {
    // Simple scoring based on available data
    const scores: any = {}
    let totalScore = 0
    let criteriaCount = 0

    // Score based on available application data
    if (application.key_skills) {
      scores.skill = Math.min(100, application.key_skills.split(",").length * 20)
      totalScore += scores.skill
      criteriaCount++
    }

    if (application.experience_years) {
      scores.experience = Math.min(100, application.experience_years * 10)
      totalScore += scores.experience
      criteriaCount++
    }

    if (application.education_level) {
      const educationScores: any = {
        "high school": 30,
        associate: 50,
        bachelor: 70,
        master: 85,
        phd: 100,
      }
      scores.education = educationScores[application.education_level.toLowerCase()] || 50
      totalScore += scores.education
      criteriaCount++
    }

    const averageScore = criteriaCount > 0 ? totalScore / criteriaCount : 0

    return {
      criteriaScores: scores,
      totalScore: Math.round(averageScore),
    }
  },
}
