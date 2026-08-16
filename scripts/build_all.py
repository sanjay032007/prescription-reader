import os, sys

files = {}

# 1. tsconfig.json
files['tsconfig.json'] = '''{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@**": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "examples"
  ]
}
'''
files['src/components/prescription/3d/types.ts'] = '''
/** Prescription 3D Types */
import type * as THREE from 'three';

export interface PrescriptionMetadata {
  doctorName: string;
  doctorDegree: string;
  specialization: string;
  regNumber: string;
  clinicName: string;
  clinicDept: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicWeb: string;
  patientName: string;
  patientAgeGender: string;
  date: string;
  rxNumber: string;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  note: string;
}

export interface PrescriptionTextureOptions {
  width?: number;
  height?: number;
  metadata?: Partial<PrescriptionMetadata>;
  medications?: MedicationItem[];
  advice?: string[];
  anisotropy?: number;
}

export interface PrescriptionPaperProps {
  width?: number;
  height?: number;
  segmentsX?: number;
  segmentsY?: number;
  curlIntensity?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
}
'''
