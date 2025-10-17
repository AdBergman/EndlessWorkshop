SET CONSTRAINTS ALL DEFERRED;

INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES (null, 'Communal Habitations', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES (null, 'Bridge', 'No adjacent bridge. This District must be built on a Stream or River.');
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+6 Dust', 'Merchant''s House', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+4 Dust', 'Trading Post', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+2 Industry', 'Works', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+2 Food', 'Farm', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+2 Influence', 'Forum', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+2 Science', 'Laboratory', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+3 Approval on Military Districts', 'Keep', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+5 Corpses', 'Feedhole', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+15 Science', 'Matriarch''s Eye', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('50 District Fortification on Military Districts', 'Matriarch''s Tail', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('+12 Approval', 'Soul Repository', null);
INSERT INTO "public"."districts" ("effect", "name", "placement_prereq") VALUES ('District must be placed on a Pacified Village', 'Lord''s Estate', null);

-- Reset sequences after insert data
SELECT setval('districts_id_seq', (SELECT COALESCE(MAX(id),0) FROM "districts"));
