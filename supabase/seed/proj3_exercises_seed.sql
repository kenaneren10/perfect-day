-- ============================================================
-- PROJ-3: Seed Data — 40 System-Übungen
-- Run AFTER the migration (20260622000000_proj3_exercises.sql)
-- Run in Supabase SQL Editor — superuser bypasses RLS
-- is_system = TRUE, user_id = NULL
-- ============================================================

INSERT INTO exercises (name, category, muscle_groups, equipment, difficulty, description, is_system, user_id)
VALUES

-- ── Kraft | Brust ─────────────────────────────────────────
(
  'Liegestütze',
  'strength', ARRAY['chest','shoulders','arms'], 'none', 'beginner',
  'Ausgangsposition in der hohen Plank. Körper gerade halten, Brust fast bis zum Boden absenken, dann explosiv hochdrücken.',
  TRUE, NULL
),
(
  'Bankdrücken',
  'strength', ARRAY['chest','shoulders','arms'], 'full', 'intermediate',
  'Auf der Bank liegen, Langhantel schulterbreit greifen. Stange kontrolliert zur Brust senken, dann kraftvoll strecken.',
  TRUE, NULL
),
(
  'Schrägbankdrücken',
  'strength', ARRAY['chest','shoulders'], 'full', 'advanced',
  'Bank auf ca. 30–45° einstellen. Betonter oberer Brustbereich. Langsame, kontrollierte Ausführung für maximale Spannung.',
  TRUE, NULL
),
(
  'Kurzhantel-Fliegende',
  'strength', ARRAY['chest'], 'basic', 'intermediate',
  'Auf der Bank liegen, Kurzhanteln über der Brust. Arme leicht gebeugt, Gewichte weit nach außen führen und zurück.',
  TRUE, NULL
),

-- ── Kraft | Rücken ────────────────────────────────────────
(
  'Klimmzüge',
  'strength', ARRAY['back','arms'], 'none', 'advanced',
  'Schulterweit oder enger greifen. Aus dem Hang hochziehen bis das Kinn über der Stange ist. Vollständig wieder strecken.',
  TRUE, NULL
),
(
  'Lat-Pulldown',
  'strength', ARRAY['back','arms'], 'full', 'intermediate',
  'Breiten Griff am Kabelzug. Stange zur Brust ziehen, dabei Schulterblätter zusammenziehen. Kontrolliert zurückführen.',
  TRUE, NULL
),
(
  'Einarmiges Kurzhantel-Rudern',
  'strength', ARRAY['back','arms'], 'basic', 'intermediate',
  'Knie und Hand auf der Bank abstützen. Kurzhantel gerade nach oben ziehen, Ellbogen nah am Körper halten.',
  TRUE, NULL
),
(
  'Superman',
  'strength', ARRAY['back'], 'none', 'beginner',
  'Bauchlage, Arme nach vorne gestreckt. Arme, Brust und Beine gleichzeitig vom Boden heben. 2 Sekunden halten.',
  TRUE, NULL
),

-- ── Kraft | Schultern ─────────────────────────────────────
(
  'Kurzhantel-Schulterdrücken',
  'strength', ARRAY['shoulders','arms'], 'basic', 'beginner',
  'Sitzend oder stehend, Kurzhanteln auf Schulterhöhe. Gerade nach oben drücken ohne den Rücken zu überstrecken.',
  TRUE, NULL
),
(
  'Seitheben',
  'strength', ARRAY['shoulders'], 'basic', 'beginner',
  'Leichtes Gewicht, Arme seitlich bis auf Schulterhöhe heben. Ellbogen minimal gebeugt, kontrollierte Bewegung.',
  TRUE, NULL
),
(
  'Frontheben',
  'strength', ARRAY['shoulders'], 'basic', 'beginner',
  'Kurzhanteln vor dem Körper halten und abwechselnd oder gleichzeitig auf Schulterhöhe nach vorne heben.',
  TRUE, NULL
),
(
  'Arnold Press',
  'strength', ARRAY['shoulders','arms'], 'basic', 'intermediate',
  'Kurzhanteln vor dem Gesicht mit Handflächen zum Körper starten. Beim Drücken nach außen drehen bis Handflächen nach vorne zeigen.',
  TRUE, NULL
),

-- ── Kraft | Arme ──────────────────────────────────────────
(
  'Bizeps-Curls',
  'strength', ARRAY['arms'], 'basic', 'beginner',
  'Kurzhanteln oder Langhantel, Ellbogen am Körper fixiert. Gewicht kontrolliert zur Schulter curlen und langsam ablassen.',
  TRUE, NULL
),
(
  'Trizeps-Kickback',
  'strength', ARRAY['arms'], 'basic', 'beginner',
  'Oberkörper nach vorne, Oberarm parallel zum Boden. Unterarm nach hinten strecken und kontrolliert zurückführen.',
  TRUE, NULL
),
(
  'Hammer-Curls',
  'strength', ARRAY['arms'], 'basic', 'beginner',
  'Neutraler Griff (Daumen oben), Kurzhanteln seitlich zur Schulter curlen. Trainiert Bizeps und Brachialis.',
  TRUE, NULL
),
(
  'Dips',
  'strength', ARRAY['arms','chest'], 'none', 'intermediate',
  'An zwei Stühlen oder parallelen Stangen abstützen. Körper senken bis Ellbogen 90° erreichen, dann hochdrücken.',
  TRUE, NULL
),

-- ── Kraft | Core ──────────────────────────────────────────
(
  'Plank',
  'strength', ARRAY['core'], 'none', 'beginner',
  'Unterarmstütz, Körper von Kopf bis Ferse gerade. Bauch- und Gesäßmuskeln aktiv halten. Zeit steigern.',
  TRUE, NULL
),
(
  'Crunches',
  'strength', ARRAY['core'], 'none', 'beginner',
  'Rückenlage, Knie gebeugt. Oberkörper leicht abheben und Bauchmuskeln anspannen. Nacken nicht mit den Händen ziehen.',
  TRUE, NULL
),
(
  'Russian Twists',
  'strength', ARRAY['core'], 'none', 'beginner',
  'Sitzt leicht zurückgelehnt, Füße anheben. Oberkörper von Seite zu Seite drehen, optional mit Gewicht.',
  TRUE, NULL
),
(
  'Beinheben',
  'strength', ARRAY['core'], 'none', 'intermediate',
  'Rückenlage, Beine gestreckt. Beine auf 90° heben und kontrolliert absenken ohne sie am Boden abzulegen.',
  TRUE, NULL
),
(
  'Dead Bug',
  'strength', ARRAY['core'], 'none', 'beginner',
  'Rückenlage, Arme gerade nach oben, Beine in 90°. Gegenüberliegende Arm-Bein-Paare absenken und zurückführen.',
  TRUE, NULL
),

-- ── Kraft | Beine ─────────────────────────────────────────
(
  'Kniebeuge',
  'strength', ARRAY['legs','glutes'], 'none', 'beginner',
  'Füße schulterbreit, Zehen leicht nach außen. Hüfte nach hinten schieben, Knie über Zehen führen, Rücken gerade.',
  TRUE, NULL
),
(
  'Kniebeuge mit Langhantel',
  'strength', ARRAY['legs','glutes'], 'full', 'advanced',
  'Langhantel auf dem oberen Rücken. Tiefer als parallele Oberschenkel wenn möglich. Kernspannung halten.',
  TRUE, NULL
),
(
  'Beinpresse',
  'strength', ARRAY['legs','glutes'], 'full', 'intermediate',
  'An der Maschine sitzend, Füße schulterbreit auf der Platte. Beine kontrolliert beugen und strecken.',
  TRUE, NULL
),
(
  'Ausfallschritte',
  'strength', ARRAY['legs','glutes'], 'none', 'beginner',
  'Großen Schritt nach vorne, hinteres Knie senkt sich fast bis zum Boden. Rücken gerade, Knie über dem Fuß.',
  TRUE, NULL
),
(
  'Beinstrecker',
  'strength', ARRAY['legs'], 'full', 'beginner',
  'An der Maschine sitzend, Beine aus dem Knie strecken und kontrolliert absenken. Isoliertes Quadrizeps-Training.',
  TRUE, NULL
),

-- ── Kraft | Gesäß ─────────────────────────────────────────
(
  'Glute Bridge',
  'strength', ARRAY['glutes'], 'none', 'beginner',
  'Rückenlage, Knie gebeugt, Füße auf dem Boden. Hüfte maximal nach oben drücken und Gesäß anspannen.',
  TRUE, NULL
),
(
  'Hip Thrust',
  'strength', ARRAY['glutes','legs'], 'basic', 'intermediate',
  'Oberer Rücken auf einer Bank, Langhantel oder Kurzhantel auf den Hüften. Hüfte explosiv nach oben drücken.',
  TRUE, NULL
),
(
  'Romanian Deadlift',
  'strength', ARRAY['glutes','back','legs'], 'basic', 'intermediate',
  'Hüftbreit stehen, Gewicht vor dem Körper. Hüfte nach hinten schieben, Oberkörper waagerecht absenken. Rücken gerade.',
  TRUE, NULL
),
(
  'Sumo-Kniebeuge',
  'strength', ARRAY['glutes','legs'], 'none', 'beginner',
  'Weiter Stand, Zehen weit nach außen. Kniebeuge mit Betonung auf Innenoberschenkel und Gesäß.',
  TRUE, NULL
),

-- ── Kraft | Ganzkörper ────────────────────────────────────
(
  'Burpees',
  'strength', ARRAY['full_body'], 'none', 'intermediate',
  'Aus dem Stand in die Plank, Liegestütz, zurück, aufspringen. Kombiniert Kraft und Ausdauer effektiv.',
  TRUE, NULL
),
(
  'Kreuzheben',
  'strength', ARRAY['full_body','back','legs'], 'full', 'advanced',
  'Langhantel vom Boden heben, Rücken gerade, Hüfte und Knie gleichzeitig strecken. Enge Körpernähe des Gewichts.',
  TRUE, NULL
),
(
  'Turkish Get-Up',
  'strength', ARRAY['full_body'], 'basic', 'advanced',
  'Mit Kettlebell oder Kurzhantel vom Liegen zum Stehen aufstehen, dabei Arm immer gestreckt halten. Hohe Koordination.',
  TRUE, NULL
),

-- ── Cardio ────────────────────────────────────────────────
(
  'Laufen',
  'cardio', ARRAY['legs','full_body'], 'none', 'beginner',
  'Gleichmäßiges Tempo für Einsteiger (Zone 2). Fersenlauf vermeiden, aufrechte Haltung, entspannte Schultern.',
  TRUE, NULL
),
(
  'Jumping Jacks',
  'cardio', ARRAY['full_body'], 'none', 'beginner',
  'Grätsche und Arme gleichzeitig nach oben und unten. Gutes Aufwärm-Übung oder Cardio-Einheit für Einsteiger.',
  TRUE, NULL
),
(
  'High Knees',
  'cardio', ARRAY['legs','core'], 'none', 'beginner',
  'Auf der Stelle laufen und Knie dabei abwechselnd weit nach oben ziehen. Arme aktiv mitschwingen.',
  TRUE, NULL
),
(
  'Mountain Climbers',
  'cardio', ARRAY['core','full_body'], 'none', 'intermediate',
  'Plank-Position halten, Knie abwechselnd explosiv Richtung Brust ziehen. Hüfte unten halten.',
  TRUE, NULL
),
(
  'Seilspringen',
  'cardio', ARRAY['legs','full_body'], 'basic', 'intermediate',
  'Seil mit den Handgelenken drehen, nicht den Armen. Leichte Kniebeugung beim Landen. Sehr effizientes Cardio.',
  TRUE, NULL
),
(
  'Box Jumps',
  'cardio', ARRAY['legs','full_body'], 'none', 'intermediate',
  'Auf eine stabile Erhöhung springen, weich landen, wieder absteigen. Explosivkraft und Koordination.',
  TRUE, NULL
),
(
  'Fahrrad-Ergometer',
  'cardio', ARRAY['legs'], 'full', 'beginner',
  'Gleichmäßige Tretbewegung, aufrechte Sitzhaltung. Widerstand und Tempo je nach Fitnesslevel anpassen.',
  TRUE, NULL
),
(
  'Rudern (Ergometer)',
  'cardio', ARRAY['full_body','back'], 'full', 'intermediate',
  'Beine drücken zuerst, dann Körper zurückneigen, dann Arme ziehen. Flüssige Bewegung für ganzkörper Ausdauer.',
  TRUE, NULL
);

-- Verify: should show 40 rows
-- SELECT COUNT(*) FROM exercises WHERE is_system = TRUE;
