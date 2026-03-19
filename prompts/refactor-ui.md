Refactor this UI code to comply with the central UI standard of this repository.

Rules:
- Replace any custom one-off components with shared components.
- Remove any second UI library imports if present.
- Ensure the screen handles loading, empty, and error states.
- Ensure backend calls go through the service layer, not inline.
- Preserve visual consistency with the rest of the project.
- Do not add unnecessary dependencies.
