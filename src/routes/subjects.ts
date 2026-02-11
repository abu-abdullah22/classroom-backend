import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { db } from "../db";
import { departments, subjects } from "../db/schema";

const router = express.Router();

// get all subjects with optional search, fitering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
    const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];
    if (search) {
      const searchPattern = `%${String(search).replace(/[%_]/g, '\\$&')}%`
      filterConditions.push(
        or(
          ilike(subjects.name, searchPattern),
          ilike(subjects.code, searchPattern),
          ilike(subjects.description, searchPattern),
        ),
      );
    }

    if (department) {
      const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`
      filterConditions.push(ilike(departments.name, deptPattern));
    }

    // combine filter conditions with AND
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const subjectslist = await db
      .select({
        ...getTableColumns(subjects),
        departments: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectslist,
      pagination: {
        currentPage,
        limitPerPage,
        totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Error fetching subjects");
  }
});

export default router;
