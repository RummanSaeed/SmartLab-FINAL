const { PrismaClient } = require("@prisma/client")
const crypto = require("crypto")

const prisma = new PrismaClient()

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

async function main() {
  const users = [
    {
      fullName: "Demo Student",
      email: "student@smartlab.pk",
      role: "student",
      school: "FBISE Partner School",
      classLevel: "10",
      section: "A",
      password: "Password123!",
    },
    {
      fullName: "Demo Teacher",
      email: "teacher@smartlab.pk",
      role: "teacher",
      school: "FBISE Partner School",
      classLevel: "10",
      section: "A",
      password: "Password123!",
    },
    {
      fullName: "Demo Admin",
      email: "admin@smartlab.pk",
      role: "admin",
      school: "FBISE HQ",
      classLevel: "Administration",
      password: "Password123!",
    },
    {
      fullName: "Demo School Admin",
      email: "schooladmin@smartlab.pk",
      role: "school_admin",
      school: "FBISE Partner School",
      classLevel: "Administration",
      password: "Password123!",
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        fullName: user.fullName,
        email: user.email.toLowerCase(),
        role: user.role,
        school: user.school,
        classLevel: user.classLevel,
        passwordHash: hashPassword(user.password),
      },
    })
  }

  const student = await prisma.user.findUnique({ where: { email: "student@smartlab.pk" } })
  const teacher = await prisma.user.findUnique({ where: { email: "teacher@smartlab.pk" } })

  if (!student || !teacher) {
    throw new Error("Demo student/teacher not found after upsert")
  }

  const classSection = await prisma.class.upsert({
    where: {
      school_classLevel_section: {
        school: "FBISE Partner School",
        classLevel: "10",
        section: "A",
      },
    },
    update: {
      teacherId: teacher.id,
    },
    create: {
      school: "FBISE Partner School",
      classLevel: "10",
      section: "A",
      teacherId: teacher.id,
    },
  })

  await prisma.user.update({
    where: { id: student.id },
    data: {
      classId: classSection.id,
      classLevel: "10",
      school: "FBISE Partner School",
    },
  })

  const dueSoon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  const dueWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.assignment.createMany({
    data: [
      {
        title: "Complete Ohm's Law practical report",
        description: "Run 3 trials and submit measured I-V table.",
        type: "experiment",
        dueDate: dueSoon,
        classId: classSection.id,
        createdById: teacher.id,
        practicalId: "ssc-phys-16",
      },
      {
        title: "Prepare NaOH solution worksheet",
        description: "Write full preparation steps and safety notes.",
        type: "questions",
        dueDate: dueWeek,
        classId: classSection.id,
        createdById: teacher.id,
        questionsSpec: {
          questions: [
            { id: "q1", prompt: "Write the steps to prepare 0.1M NaOH (100 mL)." },
            { id: "q2", prompt: "List 3 safety precautions while handling NaOH." },
          ],
        },
      },
    ],
    skipDuplicates: true,
  })

  await prisma.notice.createMany({
    data: [
      {
        title: "Lab timetable update",
        content: "Virtual lab sessions moved to 10:00 AM from Monday.",
        classId: classSection.id,
        createdById: teacher.id,
      },
      {
        title: "Safety reminder",
        content: "Always complete hazard checklist before starting practicals.",
        classId: classSection.id,
        createdById: teacher.id,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.resource.createMany({
    data: [
      {
        title: "Physics Practical Manual",
        url: "https://example.com/physics-manual.pdf",
        classId: classSection.id,
        createdById: teacher.id,
      },
      {
        title: "Chemistry Safety Guide",
        url: "https://example.com/chem-safety.pdf",
        classId: classSection.id,
        createdById: teacher.id,
      },
    ],
    skipDuplicates: true,
  })

  const run = await prisma.experimentRun.create({
    data: {
      userId: student.id,
      practicalId: "ssc-phys-01",
      practicalTitle: "Verify Ohm's law",
      simType: "ohms-law",
      status: "completed",
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 45 * 60 * 1000),
      durationSec: 900,
      score: 84,
      metadata: { teacherId: teacher.id, mode: "grading" },
      steps: {
        create: [
          { stepNo: 1, title: "Set voltage", status: "completed" },
          { stepNo: 2, title: "Measure current", status: "completed" },
        ],
      },
      measurements: {
        create: [
          { series: "trial", x: 2, y: 0.02, unitX: "V", unitY: "A" },
          { series: "trial", x: 4, y: 0.04, unitX: "V", unitY: "A" },
        ],
      },
    },
  })

  await prisma.hazardEvent.createMany({
    data: [
      {
        runId: run.id,
        severity: "medium",
        code: "HIGH_VOLTAGE",
        message: "Voltage exceeded recommended value briefly.",
      },
    ],
    skipDuplicates: true,
  })

  await prisma.tutorMessage.createMany({
    data: [
      {
        runId: run.id,
        userId: student.id,
        role: "student",
        content: "How do I calculate resistance from the table?",
        model: "groq",
      },
      {
        runId: run.id,
        userId: student.id,
        role: "assistant",
        content: "Use R = V / I for each row and compute mean.",
        model: "groq",
      },
    ],
    skipDuplicates: true,
  })

  console.log("Seeded demo users:")
  users.forEach((u) => console.log(`- ${u.email} / ${u.password} (${u.role})`))
  console.log("Seeded management records: assignments, notices, resources, runs, hazards, tutor messages")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
