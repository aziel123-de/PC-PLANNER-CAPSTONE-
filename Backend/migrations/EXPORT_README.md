# Component Export Migration

## Purpose
This migration exports all components from the MySQL database to a JSON file for backup or data migration purposes.

## Components Exported
- CPU (processors)
- GPU (graphics cards)
- PSU (power supplies)
- Motherboards
- RAM
- Storage (HDD/SSD)
- M.2 drives
- PC Cases
- Keyboards
- Mice
- Headsets
- Monitors

## How to Run

1. Make sure the backend is configured with correct database credentials in `.env`
2. Navigate to the Backend directory:
   ```
   cd Backend
   ```
3. Run the export script:
   ```
   node migrations/007_export_all_components.js
   ```

## Output
The script will create a file `components_export.json` in the `Backend/migrations/` directory containing all component data from the database.

## File Structure
```json
{
  "cpu": [...],
  "gpu": [...],
  "psu": [...],
  "mobo": [...],
  "ram": [...],
  "storage": [...],
  "m2": [...],
  "pc_case": [...],
  "keyboard": [...],
  "mouse": [...],
  "headset": [...],
  "monitor": [...]
}
```
