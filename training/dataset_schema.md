# Indian Handwritten Prescription Dataset Specification

This directory prepares the dataset schema for fine-tuning TrOCR-Large on authentic Indian doctor handwriting.

## Directory Structure
```
training/
  images/              <- Real high-resolution prescription crops
  annotations/         <- Per-image JSON annotations
  train.json           <- 80% train split
  validation.json      <- 10% validation split
  test.json            <- 10% unseen benchmark test split
```

## Annotation JSON Schema
```json
{
  "id": "rx_delhi_001_line_1",
  "image_path": "images/rx_delhi_001_line_1.jpg",
  "ground_truth": {
    "raw_handwritten_text": "Tab. Dola 650 1-0-1 x 5d pc",
    "medicine_name": "Dolo 650",
    "generic_salt": "Paracetamol 650mg",
    "prefix": "Tab.",
    "strength": "650 mg",
    "dosage_pattern": "1-0-1",
    "duration": "5 days",
    "timing": "After meals (PC)",
    "is_ambiguous": true,
    "ambiguity_notes": "First 'o' written in fast cursive resembling 'a'"
  }
}
```
