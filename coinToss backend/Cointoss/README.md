# Cointoss Project - Development Checklist

This checklist provides a step-by-step guide to building the Cointoss betting platform, covering backend, frontend, and integration tasks. Follow each step in order for a smooth development process.

---

## 1. Project Setup

-   [x] Initialize Git repository and setup version control
-   [x] Setup Java Spring Boot backend project structure
-   [ ] Setup frontend project (React, Vue, or preferred framework)
-   [ ] Configure environment variables and secrets management

## 2. User Authentication & Wallet Module

-   [x] Design User and Wallet data models
-   [x] Implement user registration API (`POST /api/auth/register`)
-   [x] Implement user login API (`POST /api/auth/login`)
-   [x] Hash and securely store user passwords
-   [x] Implement JWT or session-based authentication
-   [ ] Automatically create and credit mock wallet on registration
-   [ ] Implement wallet balance API (`GET /api/wallet/balance`)
-   [X] Create migration scripts for User and Wallet tables
-   [ ] Write unit tests for authentication and wallet logic

## 3. Betting Game Engine Module

### 3.1. Data Models

-   [ ] Design BettingCycle, Bet, and Transaction models
-   [ ] Create migration scripts for BettingCycle, Bet, Transaction tables

### 3.2. Cycle Manager (Scheduler)

-   [ ] Implement scheduled service to create/manage betting cycles every 10 minutes
-   [ ] Enforce 5-min open and 5-min locked periods
-   [ ] Trigger settlement at end of each cycle

### 3.3. Price Oracle Service

-   [ ] Integrate Quidax API to fetch BTC/USDT prices
-   [ ] Fetch and record start_price at cycle start
-   [ ] Fetch and record end_price at cycle end
-   [ ] Handle price fetch failures gracefully

### 3.4. Bet Placement Service

-   [ ] Implement bet placement API (`POST /api/game/bet`)
-   [ ] Validate user authentication and wallet balance
-   [ ] Accept bets only during open period
-   [ ] Record bets and update wallet balances

### 3.5. Payout & Settlement Service

-   [ ] Determine winning direction (UP/DOWN/PUSH)
-   [ ] Calculate pool, deduct 5% house commission
-   [ ] Calculate dynamic payout multipliers
-   [ ] Credit winnings to user wallets
-   [ ] Record all transactions

### 3.6. Edge Case Handling

-   [ ] Cancel round and refund if price fetch fails
-   [ ] Refund all bets if start_price == end_price (PUSH)
-   [ ] Refund all bets if all bets are on one side
-   [ ] Handle bet requests at cycle transition boundaries

## 4. Backend APIs

-   [ ] Implement `/api/game/current-cycle` (public game state)
-   [ ] Implement WebSocket or polling for real-time updates
-   [ ] Secure all endpoints (auth, validation)
-   [ ] Write unit and integration tests for all APIs

## 5. Frontend User Interface (UI)

-   [ ] Design and implement Sign-Up screen
-   [ ] Design and implement Login screen
-   [ ] Design and implement Main Betting screen (live countdown, multipliers, bet form, notifications)
-   [ ] Design and implement Wallet screen
-   [ ] Integrate with backend APIs
-   [ ] Implement real-time updates (WebSocket/polling)
-   [ ] Display error and outcome notifications

## 6. Third-Party Integrations

-   [ ] Configure and test Quidax API integration
-   [ ] Handle API rate limits and errors

## 7. Testing & QA

-   [ ] Write unit tests for all backend modules
-   [ ] Write integration tests for API endpoints
-   [ ] Write frontend component and e2e tests
-   [ ] Test edge cases and error handling
-   [ ] Perform user acceptance testing (UAT)

## 8. Deployment & Documentation

-   [ ] Prepare deployment scripts/configuration
-   [ ] Deploy backend and frontend to chosen environment
-   [ ] Document API endpoints and usage
-   [ ] Write user guide for platform usage
-   [ ] Monitor logs and error reports post-deployment

---

**Tip:** Check off each item as you complete it to ensure nothing is missed!
