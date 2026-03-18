# Directive: Initial Setup

## Goal
Establish the 3-layer architecture for efficient agent-led development.

## 3-Layer Structure
- **Layer 1: Directive** - This file and others in `directives/` define the "What".
- **Layer 2: Orchestration** - The agent (you) follows these instructions to execute scripts.
- **Layer 3: Execution** - Python scripts in `execution/` handle the actual "Doing".

## Success Criteria
1. `directives/` directory exists with this file.
2. `execution/` directory exists.
3. `.tmp/` directory exists for intermediate data.
4. `.env` file exists for environment configuration.

## Next Steps
- Define your first business logic directive.
- Create execution scripts as needed to perform deterministic operations.
