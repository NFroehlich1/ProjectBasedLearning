# Supabase Edge Function Deployment Guide

## Overview

Die ElevenLabs API Integration läuft über eine Supabase Edge Function, um den API Key sicher auf dem Server zu halten.

## 🔧 Setup

### 1. Supabase CLI installieren

```bash
# Mit npm
npm install -g supabase

# Mit brew (macOS)
brew install supabase/tap/supabase
```

### 2. Bei Supabase einloggen

```bash
supabase login
```

### 3. Projekt verknüpfen

```bash
supabase link --project-ref rcfgpdrrnhltozrnsgic
```

### 4. Secret setzen (bereits erledigt ✓)

Sie haben bereits den API Key als Secret hinterlegt unter:
https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/functions/secrets

**Secret Name:** `ELEVENLABS_API_KEY`  
**Secret Value:** `sk_7887513bc29bdd450ff8ee552a3713f2f8bbbcc8037572db`

### 5. Edge Function deployen

```bash
cd C:\Users\froeh\Desktop\Projekt-123
supabase functions deploy get-elevenlabs-conversations
```

## 📋 Function Details

### Endpoint
```
https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/get-elevenlabs-conversations
```

### Parameter

**Conversations Liste abrufen:**
```
GET ?agent_id=agent_3701k6gsym8hfrzbzb4cz2g9r6xj
```

**Einzelne Conversation abrufen:**
```
GET ?agent_id=agent_3701k6gsym8hfrzbzb4cz2g9r6xj&conversation_id=conv_123
```

## ✅ Test

Nach dem Deployment testen Sie die Function:

```bash
curl "https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/get-elevenlabs-conversations?agent_id=agent_3701k6gsym8hfrzbzb4cz2g9r6xj"
```

## 🔒 Sicherheit

✅ **API Key ist sicher:**
- Liegt nur als Supabase Secret vor
- Nie im Frontend-Code
- Nie in Git committed

✅ **CORS aktiviert:**
- Function ist von allen Origins erreichbar
- Kann später eingeschränkt werden

## 🐛 Troubleshooting

### Function nicht erreichbar

```bash
# Logs anschauen
supabase functions logs get-elevenlabs-conversations

# Neu deployen
supabase functions deploy get-elevenlabs-conversations --no-verify-jwt
```

### Secret nicht gesetzt

Prüfen Sie in der Supabase Console:
https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/functions/secrets

### Permission Fehler

Die Function braucht keine JWT-Verification, da sie public ist.
CORS ist bereits konfiguriert für `*` (alle Origins).

## 📝 Nächste Schritte

1. Deployen Sie die Function mit dem Command oben
2. Testen Sie die Website - der "Load Last Conversation" Button sollte funktionieren
3. Optional: CORS später auf Ihre spezifische Domain einschränken

---

**Projekt-ID:** rcfgpdrrnhltozrnsgic  
**Function Name:** get-elevenlabs-conversations  
**Secret Name:** ELEVENLABS_API_KEY

