# Step Types in MusicAid Workflows

## Philosophy

MusicAid workflow steps are designed to be **flexible, composable, and self‑contained**.  
Each step type represents a *shape of work*, not a domain-specific action.  
They do not depend on each other, external systems, or rigid assumptions.

The goal:  
**A minimal set of universal building blocks that can define any workflow efficiently.**

These types act like Lego bricks — slot them anywhere, mix them freely, and construct complex processes without coupling.

---

# The Five Step Types

## 1. NORMAL  
### What it is  
An atomic “do this” task.  
A simple action with a done/not-done state.

### Purpose  
Represents intent without structured data.

### Typical Uses  
- Bounce mix  
- Send files to collaborator  
- Export stems  
- Book studio session  

### Why it exists  
Most workflow steps should remain simple.  
`NORMAL` is the baseline building block: clear, flexible, and universal.

---

## 2. TEXT  
### What it is  
A step whose output is **a single block of written content**.

### Purpose  
Capture structured or important text that belongs to the workflow.

### Typical Uses  
- Creative brief  
- Mix notes  
- Mastering instructions  
- Session summary  

### Why it exists  
Sometimes the “work” *is* the writing.  
`TEXT` gives that work a defined space without forcing freeform comments.

---

## 3. LIST  
### What it is  
A step with **multiple checklist items** inside it.

### Purpose  
Represent procedural tasks without bloating the workflow with many steps.

### Typical Uses  
- Pre-mix checklist  
- Release-prep checklist  
- Vocal recording setup  
- QC checks  

### Why it exists  
Some steps need granularity, but still count as one logical unit.  
`LIST` keeps workflows compact and readable.

---

## 4. REVIEW  
### What it is  
A step for **timestamped, constructive notes** — usually on audio, but not restricted to it.

### Purpose  
Document detailed feedback tied to precise moments or markers.

### Typical Uses  
- Timestamped mix critique  
- Arrangement review  
- Client review pass  
- Revision notes across versions  

### Why it exists  
Creative work is iterative.  
`REVIEW` gives you a structured lane for detailed commentary without depending on file types or approval mechanics.

---

## 5. RECORD  
### What it is  
A multi-entity progress step for **tracking recording sessions**.

### Purpose  
Select one or more instruments and track their recorded/edited states.

### Typical Uses  
- Record vocals  
- Record guitars  
- Track drums across multiple mics  
- Edit or comp specific instruments  

### Why it exists  
Recording often involves several parallel pieces of work.  
`RECORD` keeps this complexity self-contained:  
all progress tracked inside the step, no external dependencies.

---

# Summary: Why These 5 Work Together

| Type | Best For | Key Strength |
|------|----------|--------------|
| NORMAL | Simple actions | Universal, zero-structure |
| TEXT | Written output | Captures important narrative data |
| LIST | Multi-item processes | Granular but compact |
| REVIEW | Timestamped critique | Precise, structured feedback |
| RECORD | Multi-instrument progress | Handles complex, long-running work |

Together, these types form a **complete vocabulary** for creative workflows —  
flexible, minimal, non-coupled, and expressive.

---

# Philosophy Summary

1. **Self-contained** — each type holds its own data; nothing else relies on it.  
2. **Combinable** — workflows mix types freely to express any process.  
3. **Non-domain-coupled** — only RECORD contains domain shape, but still remains optional and modular.  
4. **Minimal but complete** — each type introduces a unique structure with zero overlap.  
5. **Future-proof** — broad enough for current and future workflow needs.

