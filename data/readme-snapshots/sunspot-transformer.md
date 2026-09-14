# Sunspot Transformer

A GPT-style transformer decoder built from scratch in PyTorch, trained to predict monthly sunspot counts from 275 years of solar observation data (1749–present).

---

## What it does

Given the last 128 months of sunspot activity, the model predicts the next month's count, trained autoregressively the same way GPT models generate text.

**Mean Absolute Error: 16.4 sunspots** on a held-out validation set spanning 1973–2026 (scale: 0–398).

---

## Architecture

Built entirely from scratch, no pre-trained models or transformer libraries.

```
Input (128 months)
    ↓  Embedding            1 value to 64-dimensional vector
    ↓  Positional Encoding  sine/cosine position fingerprints
    ↓  Self-Attention x2    4 heads, causal masking, residual + LayerNorm
    ↓  Feedforward x2       64 to 256 to 64, GELU activation, residual + LayerNorm
    ↓  Output Head          64 to 1 (predicted next month)
```

| Parameter | Value |
|---|---|
| Embedding dimension | 64 |
| Attention heads | 4 |
| Transformer layers | 2 |
| Feedforward dimension | 256 |
| Context length | 128 months |
| Total parameters | 100,161 |

---

## Data

- **Source:** [SILSO, Royal Observatory of Belgium](https://www.sidc.be/SILSO/monthlyssnplot)
- **Size:** 3,329 monthly observations (Jan 1749 to present)
- **Preprocessing:** Min-max normalization to [0, 1], sliding window of 128 months
- **Split:** 80% train (2,560 sequences), 20% validation (641 sequences)

---

## Experiments

### Attention heads

Tested 10, 15, and 20 heads by scaling d_model to 120 so all values divide evenly.

| Heads | d_model | Parameters | MAE |
|---|---|---|---|
| 4 (baseline) | 64 | 100,161 | 16.4 |
| 10 | 120 | 349,081 | 26.7 |
| 15 | 120 | 349,081 | 16.3 |
| 20 | 120 | 349,081 | 18.1 |

15 heads gave a marginal improvement (16.3) but the baseline is nearly as good with 3.5x fewer parameters.

### Regularization (dropout and weight decay)

Tested four combinations on the baseline architecture to reduce overfitting.

| Dropout | Weight Decay | MAE | Train/Val Gap |
|---|---|---|---|
| 0.1 | 1e-4 | 25.7 | 0.001345 |
| 0.2 | 1e-4 | 22.8 | 0.000136 |
| 0.1 | 1e-3 | 17.5 | 0.002330 |
| 0.2 | 1e-3 | 17.7 | 0.003354 |
| none (baseline) | none | 16.4 | 0.001038 |

dropout=0.2 with wd=1e-4 produced the most stable model with almost no gap between train and val loss.

---

## Results

| Metric | Value |
|---|---|
| Final train loss (MSE) | 0.004139 |
| Final val loss (MSE) | 0.003103 |
| Mean Absolute Error | 16.4 sunspots |
| Validation period | Jan 1973 to May 2026 |

The model correctly learns the shape and periodicity of the 11-year solar cycle.

---

## Training

```
Epochs:        50
Batch size:    32
Optimizer:     Adam (lr=1e-3)
Loss:          MSE
Hardware:      NVIDIA T4 GPU (Google Colab)
Training time: ~3 minutes
```

---

## Usage

Open `sunspot_transformer.ipynb` in [Google Colab](https://colab.research.google.com/) and run all cells. No setup required beyond a GPU runtime.

```
Runtime > Change runtime type > T4 GPU
```

---

## File structure

```
sunspot-transformer/
├── sunspot_transformer.ipynb   # Full notebook: data, model, training, predictions
├── README.md
└── plots/
    ├── training_loss.png            # Train vs val loss curve
    ├── predictions.png              # Predicted vs actual sunspot counts
    ├── attention_heads.png          # Attention heads experiment
    └── regularization.png           # Dropout and weight decay experiment
```

---

## Author

**Anish Shirodkar**
M.S. Computer Science (AI & ML), Rutgers University
[Portfolio](https://anishshirodkar.me) · [LinkedIn](https://www.linkedin.com/in/anish-shirodkar/) · [GitHub](https://github.com/Anish0104)
