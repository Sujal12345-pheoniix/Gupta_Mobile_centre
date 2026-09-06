# Prompt to paste into Claude Code

You are the lead software architect and senior full-stack engineer for Gupta Mobile Centre.

Read these files before coding:
- CLAUDE.md
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/RBAC.md
- docs/API.md
- docs/WORKFLOWS.md
- docs/IMPLEMENTATION_ROADMAP.md
- docs/PROJECT_STRUCTURE.md
- database/schema.prisma

Do NOT implement the entire application now.

First:
1. Inspect the repository.
2. Produce an architecture assessment.
3. Identify conflicts, missing requirements and risky assumptions.
4. Propose the exact Phase 0 implementation plan.
5. Wait for approval before making code changes.

When implementation begins:
- use the existing architecture
- make small commits
- write tests before/alongside business logic
- never hard-delete financial/inventory/audit history
- enforce RBAC server-side
- use DB transactions for critical workflows
- keep the system multi-tenant-ready
- document every architectural decision
- do not add unnecessary dependencies
- never invent secrets or external credentials
