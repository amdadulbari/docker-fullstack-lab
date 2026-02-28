# ELK Stack — Centralized Logging

A fully Dockerized ELK (Elasticsearch + Logstash + Kibana) stack with Filebeat for log shipping — built as part of the `docker-fullstack-lab` collection for DevOps engineers.

---

## 1. What Is the ELK Stack?

ELK is the most widely used open-source centralized logging solution in DevOps:

| Component     | Role                                                    |
|---------------|---------------------------------------------------------|
| **Filebeat**  | Lightweight agent — watches log files and ships events  |
| **Logstash**  | Processing pipeline — parses, transforms, enriches logs |
| **Elasticsearch** | Search engine + storage — indexes and stores events |
| **Kibana**    | Browser UI — search, visualise, and build dashboards    |

---

## 2. Architecture

```
Log Files (logs/)
      │
      ▼
  Filebeat                          ← watches files, ships new lines
  └── filebeat/filebeat.yml         ← input paths + log_type tagging
      │  (Beats protocol :5044)
      ▼
  Logstash                          ← parses and enriches events
  ├── logstash/config/logstash.yml  ← server settings
  └── logstash/pipeline/logstash.conf  ← input → filter → output
      │  (HTTP :9200)
      ▼
  Elasticsearch                     ← stores indexed documents
  └── elasticsearch/elasticsearch.yml
      │  (HTTP :9200)
      ▼
  Kibana :5601                      ← visualisation dashboard
  └── kibana/kibana.yml
```

---

## 3. Quick Start

> **Prerequisite:** Elasticsearch requires `vm.max_map_count >= 262144`.
> Run once on your host machine (persists until reboot):
> ```bash
> sudo sysctl -w vm.max_map_count=262144
> ```
> To make it permanent: add `vm.max_map_count=262144` to `/etc/sysctl.conf`

```bash
# 1. Start the stack (first run takes ~60-90s for Elasticsearch to initialise)
docker compose up -d

# 2. Watch startup progress
docker compose logs -f elasticsearch

# 3. Generate sample logs (in a separate terminal)
./scripts/generate-logs.sh

# 4. Open Kibana
open http://localhost:5601
```

---

## 4. Folder Structure

```
elk-stack/
├── elasticsearch/
│   └── elasticsearch.yml       # Cluster, network, and security settings
├── logstash/
│   ├── config/
│   │   └── logstash.yml        # Logstash server settings
│   └── pipeline/
│       └── logstash.conf       # input → filter → output pipeline
├── kibana/
│   └── kibana.yml              # Elasticsearch connection + UI settings
├── filebeat/
│   └── filebeat.yml            # Log file paths + Logstash output
├── logs/                       # Drop log files here — Filebeat watches this
│   └── .gitkeep
├── scripts/
│   └── generate-logs.sh        # Generates sample access, JSON, and error logs
└── docker-compose.yml
```

---

## 5. Services and Ports

| Service       | Port | Description                              |
|---------------|------|------------------------------------------|
| Elasticsearch | 9200 | REST API — `curl localhost:9200/_cluster/health` |
| Logstash      | 5044 | Beats input (Filebeat → Logstash)        |
| Logstash      | 9600 | Monitoring API — `curl localhost:9600`   |
| Kibana        | 5601 | Browser UI — `http://localhost:5601`     |

---

## 6. Log Pipeline Explained

The `generate-logs.sh` script creates three types of logs:

| File              | Format                  | Logstash Filter Applied         |
|-------------------|-------------------------|---------------------------------|
| `logs/access.log` | Apache Combined Log     | `grok` with `COMBINEDAPACHELOG` |
| `logs/app.log`    | JSON                    | `json` filter                   |
| `logs/error.log`  | Plain text              | Passed through as-is            |

Filebeat tags each file with a `log_type` field. Logstash uses `[fields][log_type]`
to choose which filter to apply. Events land in date-partitioned indices:

```
logs-access-2024.03.15
logs-json-2024.03.15
logs-error-2024.03.15
```

---

## 7. Exploring Logs in Kibana

1. Open **http://localhost:5601**
2. Go to **Management → Stack Management → Index Patterns**
3. Create a pattern: `logs-*` with `@timestamp` as the time field
4. Go to **Discover** — select the `logs-*` pattern to see all events
5. Go to **Dashboard** to build visualisations (e.g., HTTP status code breakdown, request rate over time)

---

## 8. Useful Commands

```bash
# Check Elasticsearch cluster health
curl http://localhost:9200/_cluster/health?pretty

# List all indices
curl http://localhost:9200/_cat/indices?v

# View a sample document
curl "http://localhost:9200/logs-access-*/_search?size=1&pretty"

# Logstash monitoring API
curl http://localhost:9600/_node/stats?pretty

# View container logs
docker compose logs -f filebeat
docker compose logs -f logstash

# Stop and remove all data
docker compose down -v
```

---

## 9. Key Concepts

### Why Filebeat instead of sending directly to Logstash?
Filebeat is lightweight (<50 MB RAM) and designed to run close to the application. It handles backpressure automatically — if Logstash is slow, Filebeat queues events and retries. Logstash, being JVM-based, is heavier and better suited as a central processing node.

### Why Logstash instead of sending Filebeat directly to Elasticsearch?
Logstash adds parsing (grok), enrichment (GeoIP, user-agent parsing), and transformation (field renaming, type conversion) before storage. Raw log strings are expensive to query; structured JSON documents are not.

### Index per day
Each day's logs land in a separate index (`logs-access-2024.03.15`). This makes it easy to delete old data with Index Lifecycle Management (ILM) policies — just delete the old index.

### `xpack.security.enabled: false`
Security (TLS + authentication) is disabled for this local development setup. In production, always enable security and configure certificates and users.
