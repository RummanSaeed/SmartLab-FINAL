#!/usr/bin/env python3
"""
Simple synthetic data generator for Ohm's Law experiment.

Generates a CSV with columns: sample_id, R_ohm, V_volt, I_amp, noise_v, noise_i, label_outcome, hazard_flag

Usage:
  python backend/tools/generate_ohms_data.py --n 1000 --out backend/data/ohms_synthetic.csv

This script is intentionally lightweight so it runs quickly on CPU-only machines.
"""
import os
import argparse
import csv
import math
import random
from datetime import datetime

def generate_sample(r_min=1.0, r_max=1000.0, v_min=0.5, v_max=12.0, hazard_prob=0.01):
    R = random.uniform(r_min, r_max)
    V = random.uniform(v_min, v_max)
    # Ideal current
    I = V / R if R != 0 else 0.0
    # Add measurement noise (small gaussian)
    noise_v = random.gauss(0, max(0.005 * V, 0.001))
    noise_i = random.gauss(0, max(0.02 * I, 1e-6))
    V_meas = V + noise_v
    I_meas = max(I + noise_i, 0.0)

    # Simple hazard model: if R is extremely low relative to V -> short
    hazard = 0
    if R < 0.5 and V > 3.0:
        hazard = 1
    elif random.random() < hazard_prob:
        hazard = 1

    # Outcome label: 'ok' or 'hazard'
    label = 'hazard' if hazard else 'ok'

    return {
        'R_ohm': round(R, 4),
        'V_volt': round(V_meas, 4),
        'I_amp': round(I_meas, 6),
        'noise_v': round(noise_v, 6),
        'noise_i': round(noise_i, 6),
        'label_outcome': label,
        'hazard_flag': hazard,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--n', type=int, default=1000, help='number of samples to generate')
    parser.add_argument('--out', type=str, default='backend/data/ohms_synthetic.csv', help='output CSV path')
    args = parser.parse_args()

    out_dir = os.path.dirname(args.out)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    fieldnames = ['sample_id', 'R_ohm', 'V_volt', 'I_amp', 'noise_v', 'noise_i', 'label_outcome', 'hazard_flag']
    with open(args.out, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(args.n):
            s = generate_sample()
            row = {'sample_id': i + 1}
            row.update(s)
            writer.writerow(row)

    print(f"Wrote {args.n} samples to {args.out} at {datetime.utcnow().isoformat()}Z")


if __name__ == '__main__':
    main()
