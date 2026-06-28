---
type: BigQuery Table
title: Orders
description: One row per completed customer order.
tags: [sales, orders]
---

# Schema

| Column        | Type      | Description                  |
|---------------|-----------|-------------------------------|
| `order_id`    | STRING    | Unique order identifier.     |
| `customer_id` | STRING    | FK to [customers](/tables/customers.md). |

Part of the sales dataset.
