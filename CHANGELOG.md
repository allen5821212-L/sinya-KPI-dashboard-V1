# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

## [1.1.0] - 2025-09-17
### Added
- GitHub Actions: automatic build & deploy to **GitHub Pages** from `apps/vite`.
- Export reports include **Cross Matrix** in both **XLSX (2nd sheet)** and **PDF (2nd page)**.
- **Instant Preview** block for KPI thresholds.

### Changed
- Vite config now respects `BASE_PATH` env for correct asset paths on project sites.
- Bump version to `1.1.0` and set `homepage` hint in `package.json`.

## [1.0.0] - initial
### Added
- KPI tool (monthly × buyer × category) with cross matrix, KPI weights & traffic lights.
- XLSX/PDF export, localStorage persistence.
