# Relatório de Estrutura do Projeto Papo Social

Gerado em: 2025-02-28T10:20:15.287805

## ✅ Todos os itens obrigatórios estão presentes

## Estrutura Atual

```
├── .gitignore
├── docs/
│   ├── analysis/
│   │   ├── PAPO_SOCIAL_ONTOLOGIA.md
│   │   └── STRUCTURE_ANALYSIS.md
│   ├── API_DOCUMENTATION.md
│   ├── architecture/
│   │   ├── OVERVIEW.md
│   │   └── TECH_STACK.md
│   ├── audit/
│   │   ├── DOCUMENTATION_COVERAGE.md
│   │   └── DOCUMENTATION_SUMMARY.md
│   ├── business_context/
│   │   ├── articles_QA_example.md
│   │   ├── beliefs_matrix.md
│   │   ├── beliefs_structure.md
│   │   ├── businessmodel.md
│   │   ├── business_matrix.md
│   │   ├── challenges_matrix.md
│   │   ├── monetization_matrix.md
│   │   ├── paponews.md
│   │   ├── PapoSocial_description.md
│   │   ├── socialbelief_matrix.md
│   │   └── UserJourney_3personas.md
│   ├── CODE_STANDARDS.md
│   ├── CONTRIBUTING.md
│   ├── database/
│   │   └── DATA_MODEL.md
│   ├── GETTING_STARTED.md
│   ├── introduction.md
│   ├── mongodb_reference.md
│   ├── planning/
│   │   ├── MVP_EVOLUTION.md
│   │   ├── ROADMAP.md
│   │   └── sprint-acessibilidade-shadcn.md
│   ├── README.md
│   ├── setup/
│   │   ├── DOCUMENTATION_VIEWER.md
│   │   └── GIT_SETUP.md
│   ├── SETUP_GUIDE.md
│   └── _sidebar.md
├── frontend_setup.js
├── index.html
├── install_dependencies.py
├── package-lock.json
├── project_structure_report.md
├── pyproject.toml
├── README.md
├── requirements.txt
├── scripts/
│   ├── docs.sh
│   ├── fix-git-push.sh
│   ├── git-push.sh
│   ├── initDB.js
│   ├── project_mapper.py
│   ├── start-project.sh
│   └── verify_installation.sh
├── setup.py
└── src/
    ├── backend/
    │   ├── config/
    │   │   ├── database.py
    │   ├── main.py
    │   ├── models/
    │   │   ├── bson_types.py
    │   │   ├── check_versions.py
    │   │   ├── request.py
    │   │   ├── resident.py
    │   ├── README.md
    │   ├── requirements.txt
    │   ├── scripts/
    │   │   ├── diagnose_env.py
    │   │   ├── initialize_db.py
    │   │   ├── install_dependencies.py
    │   │   └── start_backend.py
    │   ├── setup_env.py
    └── frontend/
        ├── check_structure.js
        ├── components.json
        ├── next-env.d.ts
        ├── package-lock.json
        ├── package.json
        ├── pages/
        │   └── index.tsx
        ├── postcss.config.js
        ├── public/
        │   ├── dark_logo_transparent_background.png
        │   ├── Papo_Social.png
        │   └── white_logo_transparent_background.png
        ├── src/
        │   ├── app/
        │   │   ├── demo-voz/
        │   │   │   └── page.tsx
        │   │   └── globals.css
        │   ├── components/
        │   │   ├── speech/
        │   │   │   ├── speech-to-text.tsx
        │   │   │   └── text-to-speech.tsx
        │   │   ├── ui/
        │   │   │   ├── button.tsx
        │   │   │   ├── card.tsx
        │   │   │   ├── literacy-helper.tsx
        │   │   │   ├── speech-to-text.tsx
        │   │   │   ├── theme-provider.tsx
        │   │   │   └── voice-command-system.tsx
        │   │   └── VoiceInput.tsx
        │   ├── hooks/
        │   ├── pages/
        │   ├── services/
        │   ├── styles/
        │   ├── types/
        │   └── utils/
        │       └── utils.ts
        ├── tailwind.config.js
        ├── tailwind.config.ts
        └── tsconfig.json
```

## Próximos Passos Recomendados

2. Revisar a organização de código seguindo padrões para monorepo
3. Estabelecer padrões de codificação específicos para as tecnologias utilizadas
