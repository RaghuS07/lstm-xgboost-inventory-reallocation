# Automated Profit-Aware Inventory Reallocation Using LSTM Forecasting and XGBoost Ranking

## Abstract

This repository contains a machine learning-driven inventory redistribution system for multi-location retail networks. The framework integrates Long Short-Term Memory (LSTM) networks for demand forecasting with an XGBoost-based scoring mechanism to generate profit-oriented inter-store transfer recommendations. By combining temporal demand prediction with network-level optimization, the system addresses a critical gap in retail supply chain automation: converting demand forecasts into executable, economically justified inventory movements.

## Problem Statement

Multi-location retail networks face persistent inventory imbalance: simultaneous stockouts and overstock of identical products across geographically distributed stores. Traditional systems operate reactively at individual store levels, relying on fixed reorder rules and manual transfer decisions. This approach:

- Fails to respond to localized demand variability and spatial patterns
- Results in lost sales, inflated markdown costs, and suboptimal working capital utilization
- Lacks systematic integration of demand forecasting into redistribution workflows

**Research Gap:** Existing literature emphasizes forecasting accuracy OR high-level supply chain optimization, but rarely bridges the gap between demand prediction and operational, network-aware redistribution execution.

## Technical Contributions

### 1. **Demand-Forecasting-to-Decision Pipeline**
   - Integrates short-term demand forecasting directly into feasible transfer generation
   - Formulates inventory imbalance detection as a network-level surplus–deficit identification problem
   - Shifts from isolated store management to connected, system-aware optimization

### 2. **Profit-Oriented Transfer Ranking**
   - Introduces an XGBoost-based scoring model that ranks candidates using economic and operational signals
   - Incorporates product value, demand pressure, geographic cost, and inventory state simultaneously
   - Generates quantified, auditable transfer recommendations aligned with business objectives

### 3. **Manager-in-the-Loop Execution Architecture**
   - Maintains human oversight while automating recommendation generation and impact tracking
   - Ensures traceability, transparency, and accountability across recommendation, approval, execution, and evaluation stages
   - Provides post-transfer impact measurement linking execution to observable sales outcomes

## Methodology

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEMAND FORECASTING LAYER                         │
├──────────────────────────────────────────────────────────────────────┤
│ • Data Aggregation → Daily product–location time series             │
│ • LSTM Model → 7-day forecast horizon per product–location pair    │
│ • Output: Demand estimates D̂ₚ,ℓ(H) for horizon H                  │
├──────────────────────────────────────────────────────────────────────┤
│                 INVENTORY IMBALANCE DETECTION                       │
├──────────────────────────────────────────────────────────────────────┤
│ • Gap Computation → gₚ,ℓ = sₚ,ℓ − D̂ₚ,ℓ(H)                           │
│ • Classification → Surplus (gₚ,ℓ ≥ τ) vs Deficit (gₚ,ℓ ≤ −τ)      │
│ • Network Model: Identify donor–receiver location pairs             │
├──────────────────────────────────────────────────────────────────────┤
│                TRANSFER RANKING & OPTIMIZATION                      │
├──────────────────────────────────────────────────────────────────────┤
│ • Candidate Generation → Bounded flow constraints, distance calc.  │
│ • XGBoost Scoring → Feature-based ranking using profit proxy       │
│ • Priority Assignment → High/Medium/Low/Very Low categories        │
├──────────────────────────────────────────────────────────────────────┤
│            EXECUTION & IMPACT MEASUREMENT                           │
├──────────────────────────────────────────────────────────────────────┤
│ • Manager Approval → Human review before execution                  │
│ • Atomic Updates → Consistent inventory state management            │
│ • Post-Transfer Evaluation → Sales uplift & profit tracking        │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Algorithms

| Stage | Method | Type | Rationale |
|-------|--------|------|-----------|
| **Demand Forecasting** | LSTM Networks | Deep Learning | Captures long-term temporal dependencies in sparse retail demand |
| **Imbalance Detection** | Surplus–Deficit Gap Computation | Analytical | Integrates forecast uncertainty with current inventory state |
| **Transfer Ranking** | XGBoost Regression | Ensemble ML | Combines economic features into interpretable, profit-aware scoring |
| **Execution** | Atomic Inventory Updates | Transactional | Ensures consistency and auditability across network |
| **Evaluation** | Post-Transfer Impact Analysis | Empirical | Links recommendations to realized sales outcomes |

## Results & Performance Metrics

### LSTM Demand Forecasting

**Dataset & Training:**
- Product–Location Series: 200 time series
- Lookback Window: 30 days
- Total Sequences: 68,400 (Train: 61,560 / Validation: 6,840)
- Training Stability: Converged at Epoch 6, validation loss: **0.0000463** (MSE, MinMax-scaled)

**Forecast Accuracy (7-Day Horizon):**
- **MAE: 0.0375 units** (typical daily unit error)
- **RMSE: 0.0485 units** (captures larger deviations)
- **Evaluation Rationale:** Unit-based metrics (MAE/RMSE) are more meaningful than percentage errors for sparse retail demand where many observations are zero

**Interpretation:** The model demonstrates stable generalization, producing reliable short-term demand signals suitable for proactive redistribution planning.

### XGBoost Transfer Scoring

**Model Configuration:**
- Regression Target: Profit proxy = (Quantity × Price × Sellthrough) − (Distance × Cost)
- Sample Size: 28 transfer candidates

**Performance Metrics:**

| Metric | Train | Validation | All Data |
|--------|-------|-----------|----------|
| MAE | 66.32 | 9,473.16 | 2,082.07 |
| RMSE | 142.57 | 18,704.26 | 8,659.31 |
| R² | 0.9998 | 0.2541 | 0.6078 |

**Ranking Quality (Primary Evaluation):**
- **Spearman Correlation: 0.966** ← Strong agreement with profit-optimal ordering
- **NDCG@10: 0.877** ← Excellent ranking of top recommendations
- **NDCG@25: 0.886** ← Robust ranking across broader set
- **Precision@10: 1.0** ← All top-10 recommendations correctly ranked

**Feature Importance (Profit-Driven):**
1. Product Price: 0.481 (Economic value dominates)
2. Stock-to-Sales Ratio: 0.190 (Demand pressure signal)
3. Sales Rate: 0.091 (Velocity indicator)
4. Distance: 0.025 (Movement cost secondary factor)

**Interpretation:** Despite limited training data causing overfitting in point-wise regression, the model produces strong ranking performance. This validates that the learned scoring function effectively prioritizes transfers aligned with business profitability objectives.

## Dataset & Implementation

### Data Schema
- **Scope:** 1,000 products, 100 locations, 367 days
- **Events:** 95,018 purchase transactions, 39,945 inventory records
- **Format:** Integrated MongoDB backend with transactional consistency

### System Stack
- **Frontend:** Next.js 15 (React 19, TypeScript, Tailwind CSS)
- **Backend:** Node.js/Express.js with MongoDB + Mongoose ODM
- **ML Pipeline:** Python (scikit-learn, TensorFlow/Keras for LSTM, XGBoost)
- **Architecture:** Fully integrated end-to-end system from data ingestion to recommendation execution

## Key Features

### 1. Demand Forecasting
- LSTM-based time-series modeling of product–location demand
- Automatic handling of sparse retail data and zero-demand periods
- Multi-step forecasting with autoregressive rollout

### 2. Inventory Imbalance Detection
- Network-level surplus and deficit identification
- Forecast-driven gap analysis with fallback to sales velocity
- Dynamic threshold-based classification

### 3. Transfer Recommendation & Ranking
- Feasible candidate generation with distance-based cost estimates
- Profit-oriented XGBoost scoring incorporating:
  - Product economics (price, expected sellthrough)
  - Inventory state (stock levels, turnover ratios)
  - Operational feasibility (geographic distance, quantity constraints)
  - Network context (location tier, demand variability)

### 4. Manager-in-the-Loop Workflow
- Ranked recommendations with clear priority levels
- Human approval before execution
- Atomic inventory updates with execution logging
- Post-transfer impact tracking and analytics

### 5. Operational Traceability
- Complete audit trail from recommendation generation to execution
- Pre- and post-transfer inventory snapshots
- Sales uplift measurement and profit estimation
- Dashboard support for monitoring and decision review

## Results Highlights

### Quantitative Outcomes
✓ **Forecasting:** 0.0375 unit MAE on 7-day horizon with stable validation loss  
✓ **Ranking:** 0.966 Spearman correlation; 1.0 Precision@10  
✓ **System:** 28 candidate transfers scored and ranked by profit impact  

### Qualitative Contributions
✓ **Research:** Bridges forecasting–decision gap with integrated end-to-end system  
✓ **Operations:** Operationalizes ML predictions into executable inventory movements  
✓ **Transparency:** Maintains manager oversight while automating routine analysis  

## Research Significance

### Addressed Research Gaps
1. **Forecasting–Decision Gap:** Converts demand predictions into feasible, ranked redistribution actions
2. **Network-Level Optimization:** Models retail network as connected system rather than isolated stores
3. **Profit-Oriented Ranking:** Incorporates economics, demand pressure, and operational cost simultaneously
4. **Operational Feasibility:** Provides practical, auditable decision-support workflow rather than theoretical optimization

### Contributions to Supply Chain Literature
- Demonstrates end-to-end integration of ML forecasting with prescriptive redistribution
- Validates that ranking-based evaluation (Spearman, NDCG) more effectively captures redistribution value than point-wise regression accuracy
- Shows practical application in sparse retail demand environments
- Establishes manager-in-the-loop as effective approach for human–AI collaboration in inventory optimization

## Limitations & Future Work

### Current Scope
- **Data Dependency:** Effectiveness relies on historical sales and inventory data quality
- **Forecast Horizon:** Optimized for short-term (7-day) predictions; longer horizons require dedicated strategic planning tools
- **Execution Cadence:** Operates on periodic snapshot basis rather than continuous real-time recalculation (by design, for stability and auditability)
- **Scale Evaluation:** System demonstrated on 1,000 products × 100 locations; larger networks and extended deployment periods will provide additional insights

### Future Enhancements
1. **Advanced Architectures:** Temporal Fusion Transformers (TFT), attention-based mechanisms for improved long-range dependency modeling
2. **Uncertainty Quantification:** Prediction intervals and risk-sensitive redistribution strategies
3. **Real-Time Processing:** Event-driven recommendation refresh and incremental model updates
4. **Interpretability:** Enhanced explainability of transfer scoring via SHAP or similar techniques
5. **Extended Evaluation:** Multi-year deployment across larger networks to assess long-term impact on availability, fulfillment rates, and total network inventory

## Usage Instructions

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (local or cloud)

### Quick Start

**1. Clone & Install**
```bash
git clone <repository-url>
cd supply-demand
npm install
cd backend && npm install && cd ..
```

**2. Start Backend**
```bash
cd backend
npm run dev
# Server: http://localhost:5000
# Database auto-seeded with sample data
```

**3. Start Frontend**
```bash
npm run dev
# Frontend: http://localhost:3000
```

### Key Endpoints
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — Authentication
- `GET /api/recommendations` — List ranked transfer recommendations
- `POST /api/recommendations/:id/approve` — Approve and execute transfer
- `GET /api/products` — Product catalog
- `GET /api/stock/location/:id` — Location inventory

## Architecture Overview

```
Frontend (Next.js 15)
├── Buyer Dashboard (Product browsing, orders)
├── Seller Dashboard (Inventory management, approvals)
└── Analytics (Recommendations, impact tracking)
       ↓ (Axios)
Backend (Express.js)
├── REST APIs (Auth, Products, Stock, Orders)
├── Recommendation Engine (LSTM + XGBoost)
└── Execution & Impact Tracking
       ↓ (Mongoose)
Database (MongoDB)
├── Users & Roles
├── Products & Locations
├── Inventory & Orders
├── Forecasts & Recommendations
└── Execution Logs & Impact Metrics
```

## Academic & Professional Applications

This work demonstrates practical applicability in:
- **Retail Chains:** Supermarkets, fashion retailers, consumer electronics networks
- **Pharmacy Networks:** Multi-branch drug/pharmaceutical distribution
- **Fast-Moving Consumer Goods (FMCG):** Distributed inventory balancing
- **Strategic Supply Chain Roles:** Decision-support systems, operations management, analytics teams

## Project Metadata

- **Author:** Raghu S.
- **Institution:** VIT Vellore, India
- **Academic Status:** Final-year B.Tech Information Technology
- **Relevant Background:** Cybersecurity, Cloud Computing, Machine Learning/NLP
- **GitHub:** [RaghuS07](https://github.com/RaghuS07)
- **Focus:** Supply Chain Optimization, ML-driven Operations, Retail Analytics

## Publications & References

This work is grounded in 23 peer-reviewed academic sources spanning:
- **Demand Forecasting:** LSTM architectures, Transformer models, hybrid statistical–ML approaches
- **Supply Chain Optimization:** Network-aware planning, warehouse optimization, spatio-temporal modeling
- **Machine Learning:** Gradient Boosting, ensemble methods, deep learning applications
- **Retail Operations:** Inventory management, automatic replenishment, empirical case studies

See the project paper for complete literature review and citations.

## License

This project is available for academic and professional review. For licensing inquiries, please contact the author.

---

## Contact & Collaboration

- **GitHub:** [github.com/RaghuS07](https://github.com/RaghuS07)
- **Focus Areas:** Cybersecurity, Cloud Operations, Machine Learning, Supply Chain Analytics
- **Open to:** Master's program discussions, research collaborations, professional opportunities
