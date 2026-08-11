--
-- PostgreSQL database dump
--

\restrict 557WOd9zMFLzL5hZnK1Zh9xP0aSdFk1adZxMWXzvabCWsfC5gYse9DMKeDHCL1E

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CandidatureStatus; Type: TYPE; Schema: public; Owner: mac
--

CREATE TYPE public."CandidatureStatus" AS ENUM (
    'SOUMIS',
    'EN_ATTENTE_PAIEMENT',
    'EN_REVUE_PARTENAIRE',
    'COMPLEMENT_DEMANDE',
    'ACCEPTE',
    'REFUSE',
    'DOCUMENT_EMIS',
    'BROUILLON',
    'TERMINE'
);


ALTER TYPE public."CandidatureStatus" OWNER TO mac;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: mac
--

CREATE TYPE public."Role" AS ENUM (
    'STUDENT',
    'ADMIN',
    'PARTNER'
);


ALTER TYPE public."Role" OWNER TO mac;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "actorId" text,
    "actorRole" text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO mac;

--
-- Name: Bourse; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Bourse" (
    id text NOT NULL,
    slug text NOT NULL,
    titre text NOT NULL,
    "programmeId" text NOT NULL,
    "partnerId" text NOT NULL,
    "coveragePercent" integer NOT NULL,
    "montantMax" integer,
    quota integer DEFAULT 0 NOT NULL,
    "placesRestantes" integer DEFAULT 0 NOT NULL,
    "dateLimite" timestamp(3) without time zone NOT NULL,
    conditions text,
    "documentsRequis" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Bourse" OWNER TO mac;

--
-- Name: Candidature; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Candidature" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "programmeId" text NOT NULL,
    "partnerId" text NOT NULL,
    "firstName" text DEFAULT ''::text NOT NULL,
    "lastName" text DEFAULT ''::text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    institution text DEFAULT ''::text NOT NULL,
    field text DEFAULT ''::text NOT NULL,
    level text DEFAULT 'Non precise'::text NOT NULL,
    "lastEducationLevel" text DEFAULT ''::text NOT NULL,
    "lastDiploma" text DEFAULT ''::text NOT NULL,
    "graduationDate" text DEFAULT ''::text NOT NULL,
    gpa text DEFAULT ''::text NOT NULL,
    "targetProgram" text NOT NULL,
    status public."CandidatureStatus" DEFAULT 'SOUMIS'::public."CandidatureStatus" NOT NULL,
    "documentUrl" text,
    "documentIssuedAt" timestamp(3) without time zone,
    "identityCardRectoUrl" text,
    "identityCardVersoUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "bourseId" text,
    "bacTranscriptUrl" text,
    "bfemAttestationUrl" text
);


ALTER TABLE public."Candidature" OWNER TO mac;

--
-- Name: ContactMessage; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."ContactMessage" (
    id text NOT NULL,
    "senderName" text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ContactMessage" OWNER TO mac;

--
-- Name: Etablissement; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Etablissement" (
    id text NOT NULL,
    slug text NOT NULL,
    nom text NOT NULL,
    ville text NOT NULL,
    accreditation text,
    site text,
    resume text,
    "coverImageUrl" text,
    "logoUrl" text,
    "typeLabel" text
);


ALTER TABLE public."Etablissement" OWNER TO mac;

--
-- Name: FaqItem; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."FaqItem" (
    id text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    question text NOT NULL,
    answer text NOT NULL
);


ALTER TABLE public."FaqItem" OWNER TO mac;

--
-- Name: MetierPage; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."MetierPage" (
    id text NOT NULL,
    slug text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    label text NOT NULL,
    "shortDescription" text NOT NULL,
    salary text NOT NULL,
    employability text NOT NULL,
    "salaryNote" text NOT NULL,
    missions jsonb NOT NULL,
    skills jsonb NOT NULL,
    career jsonb NOT NULL,
    "coverImageUrl" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MetierPage" OWNER TO mac;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "readAt" timestamp(3) without time zone,
    "candidatureId" text,
    "bourseId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO mac;

--
-- Name: Paiement; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Paiement" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "candidatureId" text,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    method text NOT NULL,
    amount integer NOT NULL,
    "amountPartner" integer DEFAULT 0 NOT NULL,
    "amountPlatform" integer DEFAULT 0 NOT NULL,
    currency text NOT NULL,
    status text DEFAULT 'EN_ATTENTE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    provider text DEFAULT 'paytech'::text,
    "refCommand" text,
    token text
);


ALTER TABLE public."Paiement" OWNER TO mac;

--
-- Name: Partner; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Partner" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text,
    "contactEmail" text,
    "partnerSharePercent" integer DEFAULT 75 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    conditions text,
    description text
);


ALTER TABLE public."Partner" OWNER TO mac;

--
-- Name: Programme; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Programme" (
    id text NOT NULL,
    slug text NOT NULL,
    "etablissementId" text NOT NULL,
    "partnerId" text NOT NULL,
    titre text NOT NULL,
    ville text NOT NULL,
    duree text NOT NULL,
    "fraisDossier" integer DEFAULT 0 NOT NULL,
    devise text DEFAULT 'FCFA'::text NOT NULL,
    niveau text NOT NULL,
    placement text,
    description text NOT NULL,
    eligibilite text,
    "brochureUrl" text,
    perspectives text,
    "fraisDossierEtranger" integer
);


ALTER TABLE public."Programme" OWNER TO mac;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO mac;

--
-- Name: SiteContent; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."SiteContent" (
    key text NOT NULL,
    payload jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SiteContent" OWNER TO mac;

--
-- Name: TestimonialItem; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."TestimonialItem" (
    id text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    initials text,
    name text NOT NULL,
    role text NOT NULL,
    quote text NOT NULL,
    "avatarUrl" text,
    "ecoleNom" text,
    "partenaireNom" text
);


ALTER TABLE public."TestimonialItem" OWNER TO mac;

--
-- Name: User; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'STUDENT'::public."Role" NOT NULL,
    "partnerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    "firstName" text,
    "identityCardRectoUrl" text,
    "identityCardVersoUrl" text,
    "lastName" text,
    phone text,
    "bacTranscriptUrl" text,
    "bfemAttestationUrl" text,
    "emailVerificationToken" text,
    "emailVerified" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO mac;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO mac;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."AuditLog" (id, "actorId", "actorRole", action, "entityType", "entityId", metadata, "createdAt") FROM stdin;
cmrhubkmi0004gnv4funv5p8l	cmrhubklb0000gnv47keig422	STUDENT	AUTH_REGISTER	User	cmrhubklb0000gnv47keig422	{"email":"zeynash1@gmail.com"}	2026-07-12 13:39:46.603
cmrhyo92e0005gnpusglfi0fd	cmrhubklb0000gnv47keig422	STUDENT	CANDIDATURE_CREATED	Candidature	cmrhyo8gf0001gnpub940s9de	{"programmeId":"cmrghuclj00b9gny4qugalac8","partnerId":"cmrghoxmf0000gnzbjfp0btij","status":"EN_ATTENTE_PAIEMENT"}	2026-07-12 15:41:36.614
cmrkpyzv90001jla9igkn6cz1	cmrhubklb0000gnv47keig422	STUDENT	AUTH_LOGOUT	Session	\N	\N	2026-07-14 14:01:19.889
cmrktb9kd0004jla9dfqk2ycf	cmrktb9jt0002jla9iieuw0tz	STUDENT	AUTH_REGISTER	User	cmrktb9jt0002jla9iieuw0tz	{"email":"ada@gmail.com","acceptMarketing":true}	2026-07-14 15:34:51.182
cmrkuaobg0007jla9ldqz5y85	cmrkuaoau0005jla95eecrxbp	STUDENT	AUTH_REGISTER	User	cmrkuaoau0005jla95eecrxbp	{"email":"ad1a@gmail.com","acceptMarketing":true}	2026-07-14 16:02:23.259
cmrkubfar000ajla9croumciq	cmrkubf6m0008jla9dasm5yf2	STUDENT	AUTH_REGISTER	User	cmrkubf6m0008jla9dasm5yf2	{"email":"bintotehju@gmail.com","acceptMarketing":true}	2026-07-14 16:02:58.227
cmrkucfzz000djla9qha3yp0k	cmrkucfy0000bjla9juxbqyfh	STUDENT	AUTH_REGISTER	User	cmrkucfy0000bjla9juxbqyfh	{"email":"bintotehjujk@gmail.com","acceptMarketing":true}	2026-07-14 16:03:45.791
cmrkuezix000gjla9wh8l3vpl	cmrkuezez000ejla90zsh4nha	STUDENT	AUTH_REGISTER	User	cmrkuezez000ejla90zsh4nha	{"email":"lbintotehjujk@gmail.com","acceptMarketing":true}	2026-07-14 16:05:44.409
cmrkungdt000jjla9hoysobpq	cmrkungd9000hjla9wg5zzdr2	STUDENT	AUTH_REGISTER	User	cmrkungd9000hjla9wg5zzdr2	{"email":"lbintotmlehjujk@gmail.com","acceptMarketing":true}	2026-07-14 16:12:19.504
cmrlzgal4000mjla9ehqchfrv	cmrlzgakl000kjla9mc5gxkev	STUDENT	AUTH_REGISTER	User	cmrlzgakl000kjla9mc5gxkev	{"email":"pribotsm@gmail.com","acceptMarketing":true}	2026-07-15 11:14:29.656
cmrlzh50k000pjla9lsd3bp3k	cmrlzh509000njla91ig698rj	STUDENT	AUTH_REGISTER	User	cmrlzh509000njla91ig698rj	{"email":"pribotsjm@gmail.com","acceptMarketing":true}	2026-07-15 11:15:09.092
cmrmo3lk70002gp6e3x149ws8	\N	STUDENT	AUTH_REGISTER	User	cmrmo3ljs0000gp6emdbt7xy0	{"email":"testuser@example.com","acceptMarketing":false}	2026-07-15 22:44:27.751
cmrmo40t10004gp6ee0wqk5j3	\N	STUDENT	EMAIL_VERIFIED	User	cmrmo3ljs0000gp6emdbt7xy0	{"email":"testuser@example.com"}	2026-07-15 22:44:47.509
cmrmoafqs0002gpzgtfltsvip	\N	STUDENT	AUTH_REGISTER	User	cmrmoafqc0000gpzgcyxz8tbl	{"email":"testuser2@example.com","acceptMarketing":false}	2026-07-15 22:49:46.804
cmrmoas7w0007gpzgs008djpl	\N	STUDENT	AUTH_REGISTER	User	cmrmoas7m0005gpzgu3ljypyx	{"email":"testuser3@example.com","acceptMarketing":false}	2026-07-15 22:50:02.972
cmrmodbqd000sjla9d3eugovo	cmrmodbq0000qjla94wiyn9cz	STUDENT	AUTH_REGISTER	User	cmrmodbq0000qjla94wiyn9cz	{"email":"test@tesndeeet.sn","acceptMarketing":true}	2026-07-15 22:52:01.573
cmrmp5o2e0010jla9wvuu9zrm	cmrmodbq0000qjla94wiyn9cz	STUDENT	CANDIDATURE_CREATED	Candidature	cmrmp5nqe000wjla93eyu8nrv	{"programmeId":"cmrghuclj00b9gny4qugalac8","partnerId":"cmrghoxmf0000gnzbjfp0btij","status":"EN_ATTENTE_PAIEMENT"}	2026-07-15 23:14:03.925
cmrmp6n1y0014jla9sy281dj0	cmrmodbq0000qjla94wiyn9cz	STUDENT	AUTH_LOGOUT	Session	\N	\N	2026-07-15 23:14:49.269
cmrmp74ya0017jla936iw9mbx	cmrmp74xy0015jla9ykxtcfgy	STUDENT	AUTH_REGISTER	User	cmrmp74xy0015jla9ykxtcfgy	{"email":"ch@gn.vn","acceptMarketing":true}	2026-07-15 23:15:12.466
cmrmpgn820003gp1jsh00n0rd	cmrmp74xy0015jla9ykxtcfgy	STUDENT	AUTH_LOGIN	Session	\N	{"email":"ch@gn.vn"}	2026-07-15 23:22:36.05
cmrmpn7av0005gp1jnzj78k6d	cmrmp74xy0015jla9ykxtcfgy	STUDENT	AUTH_LOGOUT	Session	\N	\N	2026-07-15 23:27:42.006
cmrmpnz3z0008gp1j017718ah	cmrmpnz3k0006gp1j2fh7dj65	STUDENT	AUTH_REGISTER	User	cmrmpnz3k0006gp1j2fh7dj65	{"email":"ch@gn.gvn","acceptMarketing":true}	2026-07-15 23:28:18.048
cmro0ffy1000cgp1jwlbff20l	cmrmpnz3k0006gp1j2fh7dj65	STUDENT	AUTH_LOGOUT	Session	\N	\N	2026-07-16 21:17:21.912
\.


--
-- Data for Name: Bourse; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Bourse" (id, slug, titre, "programmeId", "partnerId", "coveragePercent", "montantMax", quota, "placesRestantes", "dateLimite", conditions, "documentsRequis", "isActive", "createdAt", "updatedAt") FROM stdin;
cmrghucy900msgny4zxtz99ac	bourse-imtech-nelson-mandela-bts-dt-g-nie-civil	Bourse Génie Civil (BTS/DT)	cmrghucf20005gny41rve6zlb	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.937	2026-07-12 14:37:52.757
cmrghuczc00pwgny4cf6ys4lf	bourse-imtech-nelson-mandela-bts-dt-informatique	Bourse Informatique (BTS/DT)	cmrghucf60009gny42c4yvao3	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.977	2026-07-12 14:37:52.778
cmrghucww00jmgny4lc8qh2p3	bourse-imtech-nelson-mandela-bts-dt-comptabilit	Bourse Comptabilité (BTS/DT)	cmrghucfa000fgny4o7gkgx01	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.888	2026-07-12 14:37:52.82
cmrghud1200tkgny45qru3i7h	bourse-imtech-nelson-mandela-licence-marketing-tudes	Bourse Marketing/Études (Licence)	cmrghucff000pgny4v50dtigq	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.038	2026-07-12 14:37:52.829
cmrghuczt00qugny4hcxeuwbl	bourse-imtech-nelson-mandela-master-innovation-et-responsabilit-s	Bourse Innovation et Responsabilité Sociétale (RSE) (Master)	cmrghucfj000vgny4nm69d341	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.993	2026-07-12 14:37:52.83
cmrghud1s00vigny44ehjpybx	bourse-isdb-dakar-dt-dts-bep-bts-transit-douane-2-ans	Bourse Transit douane (2 ans) (DT/DTS/BEP/BTS)	cmrghucfl000ygny4lshorulr	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.064	2026-07-12 14:37:52.833
cmrghucz600pcgny4qhuoz0mj	bourse-isdb-dakar-dt-dts-bep-bts-h-tellerie-restauration-2-ans	Bourse Hôtellerie-restauration (2 ans) (DT/DTS/BEP/BTS)	cmrghucfm0010gny4t87bpbt6	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.97	2026-07-12 14:37:52.835
cmrghud1k00v0gny488bec49e	bourse-isdb-dakar-dt-dts-bep-bts-secr-tariat-bureautique-inform	Bourse Secrétariat bureautique informatique (DT/DTS/BEP/BTS)	cmrghucfp0014gny4d8ojq5vr	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.057	2026-07-12 14:37:52.843
cmrghucyl00nwgny4ak59zgsw	bourse-isdb-dakar-master-gestion-de-projets-et-syst-me	Bourse Gestion de projets et Système d'Information (Master)	cmrghucfz001ugny4nce7z9o0	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.949	2026-07-12 14:37:52.846
cmrghucx800kcgny443cx9v6j	bourse-isdb-dakar-master-comptabilit-contr-le-audit	Bourse Comptabilité-Contrôle-Audit (Master)	cmrghucg10020gny4gdkpsti9	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.901	2026-07-12 14:37:52.852
cmrghucw500hogny4kxj6ed9i	bourse-estg-dakar-bts-bachelor-audit-et-contr-le-de-gestion	Bourse Audit et Contrôle de Gestion (BTS/Bachelor)	cmrghucg50025gny472mw7ch9	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.861	2026-07-12 14:37:52.856
cmrghud1900u2gny4lfp8qomt	bourse-estg-dakar-master-professionnel-qualit-hygi-ne-s-curit-envir	Bourse Qualité Hygiène Sécurité Environnement (QHSE) (Master Professionnel)	cmrghucgi0033gny4yfml8dkx	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.045	2026-07-12 14:37:52.862
cmrghucy700mogny4yhf65h7d	bourse-afpa-dakar-diplome-de-qualification-professionnelle-formations-courtes-en-alternan	Bourse Formations courtes en alternance (agro-business, bâtiment, industrie, hôtellerie de luxe) (Diplôme de qualification professionnelle)	cmrghucme00cogny4v1v8awkl	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.935	2026-07-12 14:37:53.014
cmrghud0a00rmgny4926els3h	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-maintenance-r-seaux-informatiq	Bourse Maintenance-Réseaux Informatiques et Télécoms (Master/Master Professionnel/Master Recherche/MBA)	cmrghucmk00d3gny4if6n5snm	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.01	2026-07-12 14:37:53.031
cmrghucyw00ougny4vewkxtct	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-gestion-publique	Bourse Gestion Publique (Master/Master Professionnel/Master Recherche/MBA)	cmrghucmm00d7gny4wr8d3r7z	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.96	2026-07-12 14:37:53.033
cmrghucvq00gsgny4f5ityn4t	bourse-estg-dakar-licence-professionnelle-achats-et-logistique	Bourse Achats et Logistique (Licence Professionnelle)	cmrghucg8002dgny41r771w7u	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.846	2026-07-12 12:54:04.762
cmrghucvt00gugny4ry3gtogo	bourse-ensup-afrique-dakar-licence-administration-des-biens-et-ge	Bourse Administration des biens et Gestion immobilière (Licence)	cmrghuclj00b9gny4qugalac8	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.849	2026-07-12 12:54:04.762
cmrghucvt00gwgny4l5r71o8b	bourse-amdi-afrique-licence-administration-droit-et-fiscal	Bourse Administration Droit et Fiscalité (Licence)	cmrghuchj005ggny4mgaay33o	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.85	2026-07-12 12:54:04.762
cmrghucwe00hugny48ldb2xlu	bourse-smi-thies-licence-banque-assurance	Bourse Banque-Assurance (Licence)	cmrghucnm00evgny46mwpovov	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.871	2026-07-12 12:54:04.762
cmrghucwg00hwgny4valom54j	bourse-imtech-nelson-mandela-licence-banque-assurance	Bourse Banque-Assurance (Licence)	cmrghucfb000jgny4opldcete	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.872	2026-07-12 12:54:04.762
cmrghucwg00hygny4tv6iy5gd	bourse-abs-school-dakar-licence-banque-assurance	Bourse Banque-Assurance (Licence)	cmrghucgy0041gny46fk8cpc4	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.873	2026-07-12 12:54:04.762
cmrghucwh00i2gny40rqhn580	bourse-esup-dakar-licence-banque-assurance-finance	Bourse Banque-Assurance-Finance (Licence)	cmrghuckf009rgny47vfrj223	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.874	2026-07-12 12:54:04.762
cmrghucwp00iwgny44el1dg7o	bourse-estg-dakar-licence-professionnelle-commerce-international	Bourse Commerce International (Licence Professionnelle)	cmrghucgd002rgny42gefzgdv	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.881	2026-07-12 12:54:04.762
cmrghucwq00iygny4lz72zwen	bourse-ipd-thomas-sankara-licence-commerce-international	Bourse Commerce International (Licence)	cmrghucjv008ugny4szgihhza	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.882	2026-07-12 12:54:04.762
cmrghucwq00j0gny47i16n5d5	bourse-cefas-senegal-licence-commerce-international	Bourse Commerce International (Licence)	cmrghuci4006ugny4hjqtkxtv	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.883	2026-07-12 12:54:04.762
cmrghucwr00j2gny46wek1bwa	bourse-smi-thies-licence-commerce-international	Bourse Commerce International (Licence)	cmrghucnj00engny4kfqv86ep	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.883	2026-07-12 12:54:04.762
cmrghucx100k2gny44atdy8j2	bourse-hecm-dakar-bts-comptabilit-et-fiscalit	Bourse Comptabilité et fiscalité (BTS)	cmrghucgk0038gny438zy5bql	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.893	2026-07-12 14:37:52.864
cmrghucx100k4gny4ul3edjyx	bourse-hecm-dakar-licence-comptabilit-et-fiscalit	Bourse Comptabilité et fiscalité (Licence)	cmrghucgl003cgny4zm4rdrkj	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.894	2026-07-12 14:37:52.869
cmrghucx000k0gny4n5ruenh6	bourse-img-rufisque-dts-bep-dep-comptabilit-de-gestion	Bourse Comptabilité de gestion (DTS/BEP/DEP)	cmrghucly00c5gny43sf2v8za	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.892	2026-07-12 14:37:53.002
cmrghucwz00jygny49he2lhjd	bourse-img-mbour-dts-comptabilit-de-gestion	Bourse Comptabilité de gestion (DTS)	cmrghucom00fjgny4nwdwcc4t	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.892	2026-07-12 14:37:53.091
cmrghucxk00l2gny4sqstfy3q	bourse-cefas-senegal-bt-bts-dts-d-partement-sant	Bourse Département Santé (BT/BTS/DTS)	cmrghuci2006qgny4zm4otgzo	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.912	2026-07-12 14:37:52.891
cmrghucxj00l0gny4fnq1n92a	bourse-elite-sante-specialisations-d-l-gu-m-dical	Bourse Délégué médical (Spécialisations)	cmrghuclx00c2gny4y4hb0u73	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.912	2026-07-12 14:37:53.001
cmrghucxz00m2gny42tyfrml5	bourse-cefas-senegal-bt-bts-dts-fili-res-techniques-lectrici	Bourse Filières Techniques (électricité, mécanique, génie industriel) (BT/BTS/DTS)	cmrghuci0006ogny4rop1zbgc	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.928	2026-07-12 14:37:52.929
cmrghucy000m4gny4rkrafemq	bourse-ipg-isti-dakar-licence-finance	Bourse Finance (Licence)	cmrghucn300dwgny42tzl9zjz	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.929	2026-07-12 12:54:04.762
cmrghucy200m6gny45lfgbviy	bourse-ipd-thomas-sankara-licence-finance	Bourse Finance (Licence)	cmrghucjk008qgny4k2v56c7a	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.93	2026-07-12 12:54:04.762
cmrghucz500p8gny4oiot0k3x	bourse-cefas-senegal-licence-grh	Bourse GRH (Licence)	cmrghuci60070gny4eikhytzm	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.969	2026-07-12 12:54:04.762
cmrghucyc00n4gny4rnxts6ie	bourse-amdi-afrique-licence-g-nie-lectrotechnique-lectro	Bourse Génie Électrotechnique-Électronique-Automatique (Licence)	cmrghuche0054gny4jmy9k5wv	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.94	2026-07-12 14:37:52.887
cmrghucyc00n6gny49q0yo4jn	bourse-esup-dakar-bts-dts-g-nie-industriel	Bourse Génie Industriel (BTS/DTS)	cmrghucka009jgny49gvz5idn	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.941	2026-07-12 14:37:52.954
cmrghucyi00nkgny46zcext7z	bourse-smi-thies-bt-bts-dec-gestion	Bourse Gestion (BT/BTS/DEC)	cmrghucn900e9gny4eojx8rqu	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.946	2026-07-12 14:37:53.048
cmrghucyd00n8gny4j6pw0qwz	bourse-cefas-senegal-licence-g-nie-informatique	Bourse Génie Informatique (Licence)	cmrghucij0078gny4mjl5cci2	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.942	2026-07-12 12:54:04.762
cmrghucyf00nagny4xy3b4kax	bourse-amdi-afrique-licence-g-nie-informatique	Bourse Génie Informatique (Licence)	cmrghuchg0058gny4t4h1wxqk	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.943	2026-07-12 12:54:04.762
cmrghucyg00negny4fn4n3hzf	bourse-ipd-thomas-sankara-licence-g-nie-logiciel	Bourse Génie Logiciel (Licence)	cmrghucj1008agny480qz4r7o	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.944	2026-07-12 12:54:04.762
cmrghucyg00nggny43ii8pmih	bourse-amdi-afrique-licence-g-ologie-mines-p-trochimie	Bourse Géologie-Mines-Pétrochimie (Licence)	cmrghuchb004ygny41gb8474v	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.945	2026-07-12 12:54:04.762
cmrghucyq00ocgny491smukdy	bourse-ensup-afrique-dakar-licence-gestion-du-transport-et-de-la	Bourse Gestion du Transport et de la Logistique (Licence)	cmrghucle00b5gny4teaanor2	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.954	2026-07-12 14:37:52.981
cmrghucyq00oegny44iiwcdn2	bourse-isca-dakar-bachelor-licence-licence-professionnelle-gestion-conomique-et-financi	Bourse Gestion Économique et Financière des Entreprises (Bachelor/Licence/Licence Professionnelle)	cmrghucmi00cxgny4rdp0hyjb	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.955	2026-07-12 14:37:53.019
cmrghucz000owgny4aorhgfoo	bourse-essem-sante-mbour-diplomes-certifications-gestionnaire-de-pharmacie	Bourse Gestionnaire de pharmacie (Diplômes/certifications)	cmrghucoi00fagny41sv0se6a	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.965	2026-07-12 14:37:53.065
cmrghucys00okgny4tlz62s0h	bourse-estg-dakar-licence-professionnelle-gestion-financi-re-et-comptabl	Bourse Gestion Financière et Comptable (Licence Professionnelle)	cmrghucg8002bgny4dxlcmh7t	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.956	2026-07-12 12:54:04.762
cmrghucyt00oogny4zvquo2m0	bourse-afpa-dakar-bts-gestion-h-teli-re	Bourse Gestion Hôtelière (BTS)	cmrghucmd00cmgny42cpw5omr	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.958	2026-07-12 12:54:04.762
cmrghucyv00osgny4kb13a9zw	bourse-sup-immo-dakar-licence-professionnelle-gestion-immobili-re	Bourse Gestion immobilière (Licence Professionnelle)	cmrghucit007pgny4jv788ljt	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.959	2026-07-12 12:54:04.762
cmrghucz100oygny4zdz7a8nn	bourse-ensup-afrique-dakar-bts-grh	Bourse GRH (BTS)	cmrghucl100atgny41h0zgyxo	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.965	2026-07-12 12:54:04.762
cmrghucz200p2gny4uxlpp8jl	bourse-estg-dakar-licence-professionnelle-grh	Bourse GRH (Licence Professionnelle)	cmrghucgc002pgny4z0y348st	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.967	2026-07-12 12:54:04.762
cmrghucz300p4gny4r7jrrr5l	bourse-isdb-dakar-licence-professionnelle-grh	Bourse GRH (Licence Professionnelle)	cmrghucfw001mgny48ulunl1r	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.968	2026-07-12 12:54:04.762
cmrghucz800pigny4xjjnjmam	bourse-ipd-thomas-sankara-licence-ia	Bourse IA (Licence)	cmrghucj3008ggny49sah87dp	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.972	2026-07-12 12:54:04.762
cmrghuczi00qcgny4psd22m2a	bourse-isbd-dakar-licence-informatique-de-gestion	Bourse Informatique de gestion (Licence)	cmrghuchv006bgny4o4fkrz2d	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.983	2026-07-12 12:54:04.762
cmrghuczj00qegny4wliqqwh3	bourse-smi-thies-licence-informatique-de-gestion	Bourse Informatique de Gestion (Licence)	cmrghucnk00epgny42qmnor3l	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.984	2026-07-12 12:54:04.762
cmrghuczk00qggny4bf186lhu	bourse-cefas-senegal-licence-informatique-de-gestion	Bourse Informatique de Gestion (Licence)	cmrghucil007agny4e6k6numz	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.985	2026-07-12 12:54:04.762
cmrghuczp00qkgny49w627c9e	bourse-isdb-dakar-licence-professionnelle-informatique-r-seaux	Bourse Informatique réseaux (Licence Professionnelle)	cmrghucfy001sgny4ioda5y9v	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.989	2026-07-12 12:54:04.762
cmrghud0b00rsgny4998rurct	bourse-imtech-nelson-mandela-bts-dt-management	Bourse Management (BTS/DT)	cmrghuce30003gny4p3zb40u4	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.012	2026-07-12 14:37:52.739
cmrghud0i00scgny4rlxm1hmz	bourse-imtech-nelson-mandela-bts-dt-marketing	Bourse Marketing (BTS/DT)	cmrghucf7000bgny49dzoedeh	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.019	2026-07-12 14:37:52.817
cmrghud0600rggny41h0dnmc7	bourse-imtech-nelson-mandela-bts-dt-logistique	Bourse Logistique (BTS/DT)	cmrghucf9000dgny4442ic5ro	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.007	2026-07-12 14:37:52.818
cmrghud0a00rogny41lkvc4br	bourse-ifaa-dakar-bachelor-licence-management	Bourse Management (Bachelor/Licence)	cmrghucko00a8gny4gml5ccbl	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.011	2026-07-12 14:37:52.967
cmrghud0900rkgny4s7s61f20	bourse-isca-dakar-bachelor-licence-licence-professionnelle-maintenance-r-seaux-informatiq	Bourse Maintenance-Réseaux Informatique et Télécommunications (Bachelor/Licence/Licence Professionnelle)	cmrghucmj00czgny4fophfw33	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.009	2026-07-12 14:37:53.019
cmrghud0b00rqgny4vs97mzfb	bourse-smi-thies-bt-bts-dec-management	Bourse Management (BT/BTS/DEC)	cmrghucnb00ebgny449k0sonr	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.011	2026-07-12 14:37:53.05
cmrghud0g00s8gny4d80opd62	bourse-smi-thies-bt-bts-dec-marketing	Bourse Marketing (BT/BTS/DEC)	cmrghucne00ehgny4ngtr7cxm	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.017	2026-07-12 14:37:53.054
cmrghud0f00s4gny4por0xra3	bourse-imtech-nelson-mandela-licence-management-international	Bourse Management International (Licence)	cmrghucfb000hgny4ngnxclau	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.016	2026-07-12 12:54:04.762
cmrghud0h00sagny4qjvbyzi8	bourse-ensup-afrique-dakar-bts-marketing	Bourse Marketing (BTS)	cmrghucl600avgny4dp3ed3ak	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.018	2026-07-12 12:54:04.762
cmrghud0k00skgny4hgiidom6	bourse-ensup-afrique-dakar-licence-marketing	Bourse Marketing (Licence)	cmrghuclk00bbgny4n05b87y5	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.021	2026-07-12 12:54:04.762
cmrghud0m00sogny49vn40c81	bourse-amdi-afrique-licence-marketing-digital-et-r-seaux-s	Bourse Marketing Digital et Réseaux Sociaux (Licence)	cmrghuchl005kgny4cln1nr7y	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.022	2026-07-12 12:54:04.762
cmrghud0m00sqgny4j41soxgu	bourse-img-mbour-bep-marketing-et-communication	Bourse Marketing et communication (BEP)	cmrghucoq00ftgny4b5qh4szu	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.023	2026-07-12 12:54:04.762
cmrghud0n00ssgny48jc03ujd	bourse-img-mbour-dep-marketing-et-communication	Bourse Marketing et communication (DEP)	cmrghucot00fzgny4szze9cdf	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.023	2026-07-12 12:54:04.762
cmrghud0n00sugny4x505zrxv	bourse-img-mbour-dts-marketing-et-communication	Bourse Marketing et communication (DTS)	cmrghucoo00fngny4zh4wj978	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.024	2026-07-12 12:54:04.762
cmrghud1b00u8gny40z5j42v4	bourse-ipd-thomas-sankara-bts-dts-r-seaux-tic	Bourse Réseaux/TIC (BTS/DTS)	cmrghucix0080gny48cbg1jw3	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.047	2026-07-12 14:37:52.939
cmrghud1900u4gny4hxygq4k5	bourse-esup-dakar-bts-dts-r-seaux-et-s-curit-informatiq	Bourse Réseaux et Sécurité informatique (BTS/DTS)	cmrghuck6009fgny4hoodaa0j	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.046	2026-07-12 14:37:52.951
cmrghud1a00u6gny47g09hgmg	bourse-isca-dakar-dt-du-dts-bts-bt-dut-certificat-deug-r-seaux-informatique	Bourse Réseaux Informatique (DT/DU/DTS/BTS/BT/DUT/Certificat/DEUG)	cmrghucmg00ctgny40vu5f5ao	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.047	2026-07-12 14:37:53.017
cmrghud1500tqgny4gwqwzdoa	bourse-isca-dakar-bachelor-licence-licence-professionnelle-multim-dia-num-rique	Bourse Multimédia Numérique (Bachelor/Licence/Licence Professionnelle)	cmrghucmj00d1gny40ruq6c6e	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.041	2026-07-12 14:37:53.02
cmrghud1700tugny4xna25zbz	bourse-essem-sante-mbour-diplomes-certifications-orthoproth-siste	Bourse Orthoprothésiste (Diplômes/certifications)	cmrghucoj00fegny4qropcdwh	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.043	2026-07-12 14:37:53.089
cmrghud1800u0gny4ir2m76re	bourse-ipd-thomas-sankara-licence-qhse	Bourse QHSE (Licence)	cmrghucju008sgny4r9pvra4h	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.045	2026-07-12 12:54:04.762
cmrghud1b00uagny4bwdc2bu8	bourse-ipd-thomas-sankara-licence-r-seaux-tic	Bourse Réseaux/TIC (Licence)	cmrghucj1008cgny4y819nkwp	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.048	2026-07-12 12:54:04.762
cmrghud1g00uogny414s932x2	bourse-elite-sante-diplomes-d-etat-sage-femme-d-tat	Bourse Sage-femme d'État (Diplômes d'État)	cmrghuclr00bogny4da8p7zwp	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.052	2026-07-12 14:37:52.987
cmrghud1h00usgny4641vnmp7	bourse-afpa-dakar-bts-sant	Bourse Santé (BTS)	cmrghucmb00ckgny4urcbkbbf	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.054	2026-07-12 14:37:53.012
cmrghud1v00vsgny4mspm340a	bourse-img-rufisque-dts-bep-dep-transport-logistique	Bourse Transport logistique (DTS/BEP/DEP)	cmrghucm100c7gny4yotjc1yj	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.068	2026-07-12 14:37:53.003
cmrghucw100hcgny4x9cbmc0y	bourse-amdi-afrique-master-analyses-biologiques	Bourse Analyses Biologiques (Master)	cmrghuchp005ugny4ohler92g	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.858	2026-07-12 12:54:04.601
cmrghucwb00hqgny4uc24y7b3	bourse-amdi-afrique-master-automatisation-en-industries-p	Bourse Automatisation en industries pétrochimiques (Master)	cmrghucho005sgny47gsno0w2	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.868	2026-07-12 12:54:04.601
cmrghud1u00vqgny4qbci1rix	bourse-img-mbour-dts-transport-logistique	Bourse Transport logistique (DTS)	cmrghucon00flgny444yoeakf	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.067	2026-07-12 12:54:04.762
cmrghud1w00vugny4cp69ilo1	bourse-estg-dakar-licence-professionnelle-transport-logistique	Bourse Transport Logistique (Licence Professionnelle)	cmrghucg9002fgny48f3elu5p	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.068	2026-07-12 12:54:04.762
cmrghud1x00vwgny4pgxaglyz	bourse-isdb-dakar-licence-professionnelle-transport-logistique	Bourse Transport Logistique (Licence Professionnelle)	cmrghucfs001agny47ly16utd	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.069	2026-07-12 12:54:04.762
cmrghucwe00hsgny4o2meayow	bourse-amdi-afrique-master-banque-priv-e-internationale	Bourse Banque Privée Internationale (Master)	cmrghuchp005wgny4r9tpw7tt	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.87	2026-07-12 12:54:04.601
cmrghucwm00imgny4yskiysbt	bourse-amdi-afrique-master-catalyse-en-g-nie-p-trochimie	Bourse Catalyse en génie pétrochimie (Master)	cmrghuchm005ogny40sekfkhu	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.879	2026-07-12 12:54:04.601
cmrghucwo00isgny4unrdamlh	bourse-abs-school-dakar-master-commerce	Bourse Commerce (Master)	cmrghuch4004hgny4nbdawp4j	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.88	2026-07-12 12:54:04.601
cmrghucwt00jagny4a774btls	bourse-estg-dakar-master-professionnel-communication-et-marketing-num	Bourse Communication et Marketing Numérique (Master Professionnel)	cmrghucgf002vgny4gkc0kffo	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.885	2026-07-12 12:54:04.601
cmrghucwv00jigny4no7egxf4	bourse-ensup-afrique-dakar-master-communication-journalisme	Bourse Communication-Journalisme (Master)	cmrghucln00bhgny46yppcnp3	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.887	2026-07-12 12:54:04.601
cmrghucxy00lwgny4plo0sy1k	bourse-abs-school-dakar-master-entrepreneuriat	Bourse Entrepreneuriat (Master)	cmrghuch5004jgny4ot5d6ao1	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.926	2026-07-12 12:54:04.601
cmrghucy200m8gny4dy4jgte6	bourse-ifaa-dakar-master-finance	Bourse Finance (Master)	cmrghuckv00amgny47l9m6s76	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.931	2026-07-12 12:54:04.601
cmrghucy300magny4nkcghc7n	bourse-abs-school-dakar-master-finance	Bourse Finance (Master)	cmrghuch4004fgny4hbasc9f7	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.931	2026-07-12 12:54:04.601
cmrghucy400mcgny4mlyfcz2x	bourse-imtech-nelson-mandela-master-finance-et-gestion-d-entrepris	Bourse Finance et Gestion d'Entreprises (Master)	cmrghucfg000rgny480wie0ov	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.932	2026-07-12 12:54:04.601
cmrghucy500mggny4ks2e4nw8	bourse-hecm-dakar-master-finance-banque-assurances	Bourse Finance-Banque-Assurances (Master)	cmrghucgv003ugny4bbhbukcn	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.933	2026-07-12 12:54:04.601
cmrghucxt00lggny4irokyjbt	bourse-amdi-afrique-master-conomie-maritime-et-portuaire	Bourse Économie Maritime et Portuaire (Master)	cmrghuchq005ygny4vsiimwih	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.921	2026-07-12 14:37:52.918
cmrghucx200k6gny4uwququy3	bourse-isbd-dakar-master-comptabilit-financi-re-et-ges	Bourse Comptabilité financière et gestion budgétaire (Master)	cmrghuchy006jgny49k9kuek2	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.895	2026-07-12 14:37:52.92
cmrghucxe00kugny4itr7a2kq	bourse-ensup-afrique-dakar-master-comptabilit-gestion	Bourse Comptabilité-Gestion (Master)	cmrghuclm00bfgny4amdiqr0x	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.906	2026-07-12 14:37:52.984
cmrghucwh00i0gny4ea9u4chi	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-banque-assurance-assurance	Bourse Banque-Assurance-Assurance (Master/Master Professionnel/Master Recherche/MBA)	cmrghucmp00ddgny4peglfub8	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.873	2026-07-12 14:37:53.037
cmrghucws00j6gny4mgexes5q	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-communication	Bourse Communication (Master/Master Professionnel/Master Recherche/MBA)	cmrghucmr00dfgny4hac51spv	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.884	2026-07-12 14:37:53.039
cmrghucwy00jsgny4tbfmcehy	bourse-smi-thies-master-comptabilit	Bourse Comptabilité (Master)	cmrghucoa00ezgny4rpltdqui	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.89	2026-07-12 14:37:53.062
cmrghucxb00kkgny4l6szqzg6	bourse-ensup-afrique-mbour-bts-licence-master-comptabilit-gestion	Bourse Comptabilité-Gestion (BTS/Licence/Master)	cmrghucox00g8gny49r4gcc14	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.903	2026-07-12 14:37:53.098
cmrghucwj00iagny4xk3iuq84	bourse-ensup-afrique-mbour-bts-licence-master-banque-finance-assurance	Bourse Banque-Finance-Assurance (BTS/Licence/Master)	cmrghucoz00gegny4eb9sb5xh	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.875	2026-07-12 14:37:53.143
cmrghucyf00ncgny490maeb97	bourse-cefas-senegal-master-g-nie-informatique	Bourse Génie Informatique (Master)	cmrghucio007egny4g5mh4rc1	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.944	2026-07-12 12:54:04.601
cmrghucyj00nogny4eic4s1ux	bourse-smi-thies-master-gestion	Bourse Gestion (Master)	cmrghucob00f1gny43jfqva11	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.947	2026-07-12 12:54:04.601
cmrghucyn00o2gny4vvt96egp	bourse-cefas-senegal-master-gestion-des-entreprises	Bourse Gestion des entreprises (Master)	cmrghucin007cgny4kphtgaci	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.951	2026-07-12 12:54:04.601
cmrghucyn00o4gny4hmvu0ejm	bourse-estg-dakar-master-professionnel-gestion-des-ressources-humaine	Bourse Gestion des Ressources Humaines (Master Professionnel)	cmrghucgg002xgny41w3jl747	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.952	2026-07-12 12:54:04.601
cmrghucyo00o6gny4oqfjcvg7	bourse-hecm-dakar-master-gestion-des-ressources-humaine	Bourse Gestion des Ressources Humaines (Master)	cmrghucgu003qgny4o3b2c4xj	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.952	2026-07-12 12:54:04.601
cmrghucyp00oagny4z3kzqc0p	bourse-isdb-dakar-master-gestion-des-services-sanitaire	Bourse Gestion des services sanitaires et sociaux (Master)	cmrghucg10022gny4k1urzotx	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.953	2026-07-12 12:54:04.601
cmrghucyr00oggny4wdcm5yro	bourse-ipg-isti-dakar-master-gestion-et-affaires	Bourse Gestion et Affaires (Master)	cmrghucn700e4gny4d46su24u	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.955	2026-07-12 12:54:04.601
cmrghucyr00oigny41pjy83qm	bourse-isdb-dakar-master-gestion-et-am-nagement-urbains	Bourse Gestion et aménagement urbains (Master)	cmrghucfz001wgny46ejg7rdi	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.956	2026-07-12 12:54:04.601
cmrghucyt00omgny4ok21pxxa	bourse-estg-dakar-master-professionnel-gestion-financi-re-et-comptabl	Bourse Gestion Financière et Comptable (Master Professionnel)	cmrghucgg002zgny4r858bw3v	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.957	2026-07-12 12:54:04.601
cmrghucz500pagny4bccn4typ	bourse-amdi-afrique-master-grh	Bourse GRH (Master)	cmrghuchs0064gny4g7gsfibc	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.97	2026-07-12 12:54:04.601
cmrghuczn00qigny4hlwn7cdl	bourse-cefas-senegal-master-informatique-de-gestion	Bourse Informatique de Gestion (Master)	cmrghucip007ggny40oo0yu86	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.988	2026-07-12 12:54:04.601
cmrghucyk00nugny4am5kzwhx	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-gestion-de-projets	Bourse Gestion de Projets (Master/Master Professionnel/Master Recherche/MBA)	cmrghucmn00d9gny4hpnwjqdn	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.949	2026-07-12 14:37:53.033
cmrghuczs00qsgny4dvn4oz11	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-ing-nierie-financi-re	Bourse Ingénierie Financière (Master/Master Professionnel/Master Recherche/MBA)	cmrghucmo00dbgny4rdkct2qm	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.993	2026-07-12 14:37:53.034
cmrghucyo00o8gny4y6mppmkk	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-gestion-des-ressources-humaine	Bourse Gestion des Ressources Humaines (Master/Master Professionnel/Master Recherche/MBA)	cmrghucms00dhgny4nfz9ytls	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.953	2026-07-12 14:37:53.041
cmrghuczq00qmgny4cocbbbfm	bourse-ipg-isti-dakar-master-ing-nierie-lectrotechnique	Bourse Ingénierie (électrotechnique/électromécanique/froid-climatisation) (Master)	cmrghucn600e2gny4wreqenqw	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.99	2026-07-12 14:37:53.045
cmrghucz200p0gny4kypmcbrj	bourse-ensup-afrique-mbour-bts-licence-master-grh	Bourse GRH (BTS/Licence/Master)	cmrghucoy00gagny4q4cepx8o	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.966	2026-07-12 14:37:53.099
cmrghucyu00oqgny4utqrfh90	bourse-ensup-afrique-mbour-bts-licence-master-gestion-immobili-re	Bourse Gestion immobilière (BTS/Licence/Master)	cmrghucp000gigny4tu5binrv	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.958	2026-07-12 14:37:53.146
cmrghud0700rigny4vr9v5d97	bourse-amdi-afrique-master-logistique-et-transport-intern	Bourse Logistique et Transport International (Master)	cmrghuchr0060gny44i68oeim	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.007	2026-07-12 12:54:04.601
cmrghud0c00rugny4cbmnfs9p	bourse-smi-thies-master-management	Bourse Management (Master)	cmrghucod00f3gny4fr4927v2	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.013	2026-07-12 12:54:04.601
cmrghud0d00rwgny47e3hn5yr	bourse-ifaa-dakar-master-management	Bourse Management (Master)	cmrghuckt00aigny4tentavos	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.013	2026-07-12 12:54:04.601
cmrghud0e00s0gny42wt54h7r	bourse-amdi-afrique-master-management-du-luxe	Bourse Management du Luxe (Master)	cmrghucht0066gny49a4fny01	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.014	2026-07-12 12:54:04.601
cmrghud0f00s2gny4cwgmjurw	bourse-estg-dakar-master-professionnel-management-et-strat-gie-d-entr	Bourse Management et Stratégie d'Entreprise (Master Professionnel)	cmrghucgh0031gny4g691qhli	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.015	2026-07-12 12:54:04.601
cmrghud0l00smgny4bcy4jjex	bourse-amdi-afrique-master-marketing-digital-et-m-dias-so	Bourse Marketing Digital et Médias Sociaux (Master)	cmrghuchu0068gny40btd8jse	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.021	2026-07-12 12:54:04.601
cmrghud0y00tcgny4ku5phwk0	bourse-estg-dakar-master-professionnel-marketing-communication	Bourse Marketing-Communication (Master Professionnel)	cmrghucge002tgny40470wz04	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.035	2026-07-12 12:54:04.601
cmrghud0z00tegny4q1prg4p2	bourse-isdb-dakar-master-marketing-communication	Bourse Marketing-Communication (Master)	cmrghucg0001ygny4o66w6lhw	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.036	2026-07-12 12:54:04.601
cmrghud1000tggny407ku0ozj	bourse-hecm-dakar-master-marketing-communication-digita	Bourse Marketing-Communication Digitale (Master)	cmrghucgu003sgny40ou7qmod	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.036	2026-07-12 12:54:04.601
cmrghud1600tsgny4fqxen7bc	bourse-abs-school-dakar-master-num-rique	Bourse Numérique (Master)	cmrghuch3004dgny4hzdthx3b	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.042	2026-07-12 12:54:04.601
cmrghud0d00rygny4p8knh06u	bourse-amdi-afrique-master-management-de-la-qualit	Bourse Management de la Qualité (Master)	cmrghuchs0062gny4q51mhc50	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.014	2026-07-12 14:37:52.919
cmrghud1400togny4uy74abup	bourse-ipd-thomas-sankara-master-m-mes-fili-res-que-la-licence	Bourse Mêmes filières que la Licence, poursuivies en 2ᵉ cycle (Master)	cmrghuck10096gny49kv9f40p	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.04	2026-07-12 14:37:52.946
cmrghud1300tmgny4qsxz7l0i	bourse-ifaa-dakar-master-masters-sp-cialis-s-sant	Bourse Masters spécialisés santé (Master)	cmrghuckw00aogny4tcpj5ja3	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.039	2026-07-12 14:37:52.975
cmrghud1700twgny49g4hh7ry	bourse-ensup-afrique-dakar-master-passation-des-march-s-publics	Bourse Passation des marchés publics GRH (Master)	cmrghuclo00bjgny49z21w3lr	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.044	2026-07-12 14:37:52.986
cmrghud1100tigny4ntyqrtmk	bourse-isca-dakar-master-master-professionnel-master-recherche-mba-marketing-communication-et-act	Bourse Marketing-Communication et Action Commerciale (Master/Master Professionnel/Master Recherche/MBA)	cmrghucml00d5gny468b8hlsk	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.037	2026-07-12 14:37:53.032
cmrghud0j00sggny4vb7xgqff	bourse-ensup-afrique-mbour-bts-licence-master-marketing	Bourse Marketing (BTS/Licence/Master)	cmrghucp000gggny4txyum8nx	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.02	2026-07-12 14:37:53.145
cmrghud0g00s6gny4pkki6o3a	bourse-ensup-afrique-mbour-bts-licence-master-march-s-publics	Bourse Marchés publics (BTS/Licence/Master)	cmrghucp100gkgny4cyrt5avv	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.016	2026-07-12 14:37:53.147
cmrghud1f00umgny4hssbh3zx	bourse-ifaa-dakar-master-rh	Bourse RH (Master)	cmrghucku00akgny4ejj0x4qt	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.052	2026-07-12 12:54:04.601
cmrghud1o00v8gny4ebnyqae7	bourse-imtech-nelson-mandela-master-technologies-de-l-information	Bourse Technologies de l'Information (Master)	cmrghucfi000tgny4muqmarb7	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.06	2026-07-12 12:54:04.601
cmrghud1y00w0gny4xcgi1s4r	bourse-estg-dakar-master-professionnel-transport-logistique	Bourse Transport Logistique (Master Professionnel)	cmrghucgi0035gny4cs9gzah1	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.07	2026-07-12 12:54:04.601
cmrghud2800wigny4fr3ezpri	bourse-ensup-afrique-dakar-master-transport-logistique	Bourse Transport-Logistique (Master)	cmrghuclp00blgny4ln0p2yh0	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.081	2026-07-12 12:54:04.601
cmrghud2900wkgny4fdzh08pd	bourse-hecm-dakar-master-transport-logistique	Bourse Transport-Logistique (Master)	cmrghucgw003wgny4ym1bzurb	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.082	2026-07-12 12:54:04.601
cmrghucvv00h2gny4j3kguuwf	bourse-smi-thies-licence-administration-r-seaux	Bourse Administration Réseaux (Licence)	cmrghucnl00ergny4cdhsryry	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.852	2026-07-12 12:54:04.762
cmrghucvw00h4gny4umpioazr	bourse-ipg-isti-dakar-licence-affaires	Bourse Affaires (Licence)	cmrghucn400dygny4e2rxromu	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.853	2026-07-12 12:54:04.762
cmrghucw000h8gny4zyh5d5jy	bourse-amdi-afrique-licence-agroalimentaire	Bourse Agroalimentaire (Licence)	cmrghucha004wgny43dkfz9q7	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.857	2026-07-12 12:54:04.762
cmrghucw200hegny4x81q4q1v	bourse-smi-thies-licence-assistanat	Bourse Assistanat (Licence)	cmrghucnm00etgny4slt8at55	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.858	2026-07-12 12:54:04.762
cmrghucw300hggny4394m1aa9	bourse-estg-dakar-licence-professionnelle-assistanat-de-gestion	Bourse Assistanat de Gestion (Licence Professionnelle)	cmrghucgb002lgny4b40c7jx0	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.859	2026-07-12 12:54:04.762
cmrghud1800tygny4vdz4pdge	bourse-amdi-afrique-master-p-trochimie-et-proc-d-s-polym	Bourse Pétrochimie et procédés polymères (Master)	cmrghuchn005qgny4j9k8cz4d	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.044	2026-07-12 14:37:52.916
cmrghucw100hagny42bjktohu	bourse-cefas-senegal-bt-bts-dts-analyse-biologique-sant	Bourse Analyse Biologique (Santé) (BT/BTS/DTS)	cmrghuci0006mgny4y3743slj	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.857	2026-07-12 14:37:52.921
cmrghucvu00gygny4amfvgfj3	bourse-esup-dakar-bts-dts-administration-et-gestion-des	Bourse Administration et Gestion des Entreprises (BTS/DTS)	cmrghuck30099gny4ma0hvz9r	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.85	2026-07-12 14:37:52.947
cmrghucvv00h0gny4whxttfe4	bourse-esup-dakar-licence-administration-et-gestion-des	Bourse Administration et Gestion des Entreprises (Licence)	cmrghuckc009lgny4a5eu8q3u	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.851	2026-07-12 14:37:52.958
cmrghucvz00h6gny4lilnmjhr	bourse-ifaa-dakar-bachelor-licence-agroalimentaire	Bourse Agroalimentaire (Bachelor/Licence)	cmrghuckp00aagny4axcqvf59	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.856	2026-07-12 14:37:52.968
cmrghucw400higny4dne4ub31	bourse-elite-sante-diplomes-d-etat-assistant-infirmier	Bourse Assistant infirmier (Diplômes d'État)	cmrghucls00bsgny4jndjl8ck	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.86	2026-07-12 14:37:52.999
cmrghucw400hkgny4c6pm170b	bourse-essem-sante-mbour-diplomes-certifications-assistant-infirmier	Bourse Assistant Infirmier (Diplômes/certifications)	cmrghucoh00f8gny4ein4bcst	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.86	2026-07-12 14:37:53.064
cmrghud2100w8gny44smm5o2w	bourse-ensup-afrique-mbour-bts-licence-master-transport-logistique	Bourse Transport-Logistique (BTS/Licence/Master)	cmrghucoy00gcgny4gaojvrmg	cmrghoxmf0000gnzbjfp0btij	50	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.073	2026-07-12 14:37:53.1
cmrghucw500hmgny4jlwfgdxa	bourse-ipd-thomas-sankara-licence-audit	Bourse Audit (Licence)	cmrghucjx008ygny48zsg3s9l	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.861	2026-07-12 12:54:04.762
cmrghucwk00icgny4sc69klyd	bourse-estg-dakar-licence-professionnelle-banque-finance-assurance	Bourse Banque-Finance-Assurance (Licence Professionnelle)	cmrghucgb002ngny4dz4ynsr5	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.876	2026-07-12 12:54:04.762
cmrghucwk00iegny46dpujazi	bourse-isdb-dakar-licence-professionnelle-banque-finance-assurance	Bourse Banque-Finance-Assurance (Licence Professionnelle)	cmrghucfu001ggny4oq9lglmt	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.877	2026-07-12 12:54:04.762
cmrghucwl00iggny439ua9yj4	bourse-cefas-senegal-licence-banque-finance-assurance	Bourse Banque-Finance-Assurance (Licence)	cmrghuci3006sgny44wvxkwyh	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.877	2026-07-12 12:54:04.762
cmrghucwl00iigny4h13a62i8	bourse-ensup-afrique-dakar-licence-banque-finance-assurance	Bourse Banque-Finance-Assurance (Licence)	cmrghuclg00b7gny4hh5o79lo	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.878	2026-07-12 12:54:04.762
cmrghucwm00ikgny4k1p0xb8y	bourse-sup-immo-dakar-licence-professionnelle-b-timent-et-g-nie-civil	Bourse Bâtiment et Génie Civil (Licence Professionnelle)	cmrghuciu007tgny47x0fayl6	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.878	2026-07-12 12:54:04.762
cmrghucwr00j4gny43ro7csyt	bourse-abs-school-dakar-licence-commerce-international	Bourse Commerce International (Licence)	cmrghucgz0045gny4m8t7p6bl	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.884	2026-07-12 12:54:04.762
cmrghucws00j8gny49v644xl4	bourse-esup-dakar-licence-communication-d-entreprise	Bourse Communication d'entreprise (Licence)	cmrghuckd009ngny4bwpq7wd0	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.885	2026-07-12 12:54:04.762
cmrghucwu00jggny4yyna9d7z	bourse-ensup-afrique-dakar-licence-communication-journalisme	Bourse Communication-Journalisme (Licence)	cmrghuclc00b1gny47v97us6k	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.887	2026-07-12 12:54:04.762
cmrghucwt00jcgny4z4qzj8tu	bourse-estg-dakar-bts-bachelor-communication-et-publicit	Bourse Communication et Publicité (BTS/Bachelor)	cmrghucg60027gny4q7zb2x9i	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.886	2026-07-12 14:37:52.857
cmrghucwi00i6gny4f3izu39a	bourse-estg-dakar-bts-bachelor-banque-finance-assurance	Bourse Banque-Finance-Assurance (BTS/Bachelor)	cmrghucg70029gny44m4inwv1	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.874	2026-07-12 14:37:52.858
cmrghucwu00jegny47sqy32f9	bourse-estg-dakar-licence-professionnelle-communication-et-publicit	Bourse Communication et Publicité (Licence Professionnelle)	cmrghucga002hgny471g4m9c6	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.886	2026-07-12 14:37:52.861
cmrghucwn00iogny4zk80xycr	bourse-sup-immo-dakar-certificat-certificat-professionnel-de-l	Bourse Certificat Professionnel de l'Immobilier (CPI, 6 mois) (Certificat)	cmrghucir007jgny42wr8fhfw	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.879	2026-07-12 14:37:52.931
cmrghucwi00i8gny478a5e8hy	bourse-ifaa-dakar-bts-dts-banque-finance-assurance	Bourse Banque-Finance-Assurance (BTS/DTS)	cmrghuckj009wgny4kql28w6g	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.875	2026-07-12 14:37:52.961
cmrghucwo00iugny42fihou6o	bourse-ifaa-dakar-bts-dts-commerce-international	Bourse Commerce International (BTS/DTS)	cmrghuckm00a2gny4id5wi3a2	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.881	2026-07-12 14:37:52.964
cmrghucwi00i4gny47busqr2m	bourse-ifaa-dakar-bachelor-licence-banque-finance-assurance	Bourse Banque-Finance-Assurance (Bachelor/Licence)	cmrghucks00aggny46kfpqqli	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.874	2026-07-12 14:37:52.972
cmrghucwv00jkgny4hhtz46iv	bourse-smi-thies-bt-bts-dec-comptabilit	Bourse Comptabilité (BT/BTS/DEC)	cmrghucn800e7gny4a9fijnn8	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.888	2026-07-12 14:37:53.046
cmrghucwn00iqgny42tmivyr1	bourse-smi-thies-bt-bts-dec-commerce	Bourse Commerce (BT/BTS/DEC)	cmrghucnc00edgny40ms1yixw	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.88	2026-07-12 14:37:53.052
cmrghucxr00l8gny4mx26lxwp	bourse-isdb-dakar-licence-professionnelle-droit-des-affaires	Bourse Droit des affaires (Licence Professionnelle)	cmrghucfr0018gny4fluz37rd	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.919	2026-07-12 12:54:04.762
cmrghucx800kagny48ap7jzr4	bourse-imtech-nelson-mandela-licence-comptabilit-contr-le-audit-c	Bourse Comptabilité-Contrôle-Audit (CCA) (Licence)	cmrghucfc000lgny4v03gq1ed	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.9	2026-07-12 14:37:52.821
cmrghucx700k8gny4pq3yjxxx	bourse-isdb-dakar-dt-dts-bep-bts-comptabilit-gestion-de-caisse	Bourse Comptabilité gestion de caisse (DT/DTS/BEP/BTS)	cmrghucfn0012gny4x14hlge2	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.899	2026-07-12 14:37:52.837
cmrghucxc00kmgny4qohffgen	bourse-isdb-dakar-licence-professionnelle-comptabilit-gestion	Bourse Comptabilité-Gestion (Licence Professionnelle)	cmrghucfv001kgny4aocvtpnr	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.904	2026-07-12 14:37:52.844
cmrghucxc00kogny4m4jt2ies	bourse-abs-school-dakar-licence-comptabilit-gestion	Bourse Comptabilité-Gestion (Licence)	cmrghuch20049gny4lpxssil7	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.905	2026-07-12 14:37:52.871
cmrghucxe00kwgny4ysgjwvj3	bourse-amdi-afrique-dt-diplomes-sante-d-etat-d-l-gation-m-dicale	Bourse Délégation Médicale (DT/Diplômes santé d'État)	cmrghuch8004sgny4qw3hr8xq	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.907	2026-07-12 14:37:52.88
cmrghucxd00ksgny47bxuq7p6	bourse-cefas-senegal-licence-comptabilit-gestion	Bourse Comptabilité-Gestion (Licence)	cmrghuci4006wgny4rak2batb	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.906	2026-07-12 14:37:52.93
cmrghucxl00l4gny44v77u3cf	bourse-sup-immo-dakar-diplome-d-ecole-dipl-me-d-agent-immobilier-da	Bourse Diplôme d'Agent Immobilier (DAI, 9 mois) (Diplôme d'école)	cmrghucir007lgny4gb4uneo8	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.913	2026-07-12 14:37:52.933
cmrghucxm00l6gny413tmmejh	bourse-sup-immo-dakar-diplome-d-ecole-dipl-me-professionnel-de-l-imm	Bourse Diplôme Professionnel de l'Immobilier (DPI) (Diplôme d'école)	cmrghucis007ngny4l34t9s76	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.914	2026-07-12 14:37:52.934
cmrghucww00jogny4klrzkhwe	bourse-ipd-thomas-sankara-bts-dts-comptabilit	Bourse Comptabilité (BTS/DTS)	cmrghuciz0084gny4yjdc2xq9	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.889	2026-07-12 14:37:52.941
cmrghucwx00jqgny4ozecw7cb	bourse-ipd-thomas-sankara-licence-comptabilit	Bourse Comptabilité (Licence)	cmrghucj7008kgny4o6ymwymf	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.889	2026-07-12 14:37:52.944
cmrghucxa00kigny4se1jh4qx	bourse-ifaa-dakar-bts-dts-comptabilit-gestion	Bourse Comptabilité-Gestion (BTS/DTS)	cmrghuckk009ygny4qtunfagh	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.903	2026-07-12 14:37:52.962
cmrghucx900kegny4u8w77cw8	bourse-ifaa-dakar-bachelor-licence-comptabilit-gestion	Bourse Comptabilité-Gestion (Bachelor/Licence)	cmrghuckr00aegny4hrg75bc1	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.901	2026-07-12 14:37:52.97
cmrghucxa00kggny4rcu0wgmk	bourse-ensup-afrique-dakar-bts-comptabilit-gestion	Bourse Comptabilité-Gestion (BTS)	cmrghucky00argny40tdupmt7	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.902	2026-07-12 14:37:52.977
cmrghucxd00kqgny46h78u0rr	bourse-ensup-afrique-dakar-licence-comptabilit-gestion	Bourse Comptabilité-Gestion (Licence)	cmrghucl900azgny4axfu1bqw	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.905	2026-07-12 14:37:52.979
cmrghucxi00kygny4qdiqf98g	bourse-essem-sante-mbour-diplomes-certifications-d-l-gu-m-dical	Bourse Délégué Médical (Diplômes/certifications)	cmrghucoi00fcgny4fi86xmw0	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.91	2026-07-12 14:37:53.066
cmrghucwy00jugny46qrbhevb	bourse-img-mbour-bep-comptabilit-de-gestion	Bourse Comptabilité de gestion (BEP)	cmrghucoo00fpgny4oh34swi1	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.891	2026-07-12 14:37:53.092
cmrghucwz00jwgny40uhbadq6	bourse-img-mbour-dep-comptabilit-de-gestion	Bourse Comptabilité de gestion (DEP)	cmrghucoq00fvgny4ci10p27u	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.891	2026-07-12 14:37:53.093
cmrghucxr00lagny4luqutygg	bourse-abs-school-dakar-licence-droit-et-contentieux-des-affai	Bourse Droit et Contentieux des Affaires (Licence)	cmrghuch10047gny49zzwadgb	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.92	2026-07-12 12:54:04.762
cmrghucxs00lcgny4wi94gtaz	bourse-sup-immo-dakar-licence-professionnelle-droit-immobilier-et-foncier	Bourse Droit immobilier et foncier (Licence Professionnelle)	cmrghuciu007rgny46mpwutdf	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.92	2026-07-12 12:54:04.762
cmrghucxy00lygny4dbmg668p	bourse-img-rufisque-licence-professionnelle-fili-res-de-gestion-et-managem	Bourse Filières de gestion et management (Licence Professionnelle)	cmrghucm400cdgny4mu7wxdvi	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.927	2026-07-12 12:54:04.762
cmrghucxz00m0gny4brfgslmn	bourse-abs-school-dakar-bts-fili-res-homologu-es-par-le-mi	Bourse Filières homologuées par le ministère de la Formation professionnelle (transit-douane, gestion, etc.) (BTS)	cmrghucgx003zgny46czeewtc	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.927	2026-07-12 12:54:04.762
cmrghucy400megny4fjxbin91	bourse-hecm-dakar-licence-finance-banque-assurances	Bourse Finance-Banque-Assurances (Licence)	cmrghucgm003egny4fqhlomq2	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.933	2026-07-12 12:54:04.762
cmrghucy800mqgny40tjivgn2	bourse-ipg-isti-dakar-bts-froid-climatisation	Bourse Froid-Climatisation (BTS)	cmrghucmy00dogny4koyac3in	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.936	2026-07-12 12:54:04.762
cmrghucxu00lkgny4iq9fekat	bourse-imtech-nelson-mandela-bts-dt-lectrom-canique	Bourse Électromécanique (BTS/DT)	cmrghucf40007gny41b3zp7ot	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.922	2026-07-12 14:37:52.76
cmrghucxw00lqgny4i3l3n3vr	bourse-imtech-nelson-mandela-licence-lectronique-lectrotechnique	Bourse Électronique-Électrotechnique-Automatique (EEA) (Licence)	cmrghucfd000ngny4kjg63vcb	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.924	2026-07-12 14:37:52.825
cmrghucxv00lmgny4rpqeu5wd	bourse-amdi-afrique-licence-lectrom-canique	Bourse Électromécanique (Licence)	cmrghuchh005cgny4bt20t7uf	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.923	2026-07-12 14:37:52.888
cmrghucxs00legny4mdwminpx	bourse-amdi-afrique-licence-conomie-et-gestion-quantitati	Bourse Économie et Gestion Quantitatives (Licence)	cmrghuchi005egny42drmqnbm	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.921	2026-07-12 14:37:52.889
cmrghucy600mkgny4f0bqkovd	bourse-sup-immo-dakar-licence-professionnelle-fiscalit-immobili-re	Bourse Fiscalité immobilière (Licence Professionnelle)	cmrghuciv007vgny4knu71w5u	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.934	2026-07-12 14:37:52.935
cmrghucxx00lugny4ks66k48z	bourse-ipd-thomas-sankara-licence-lectrotechnique	Bourse Électrotechnique (Licence)	cmrghucj2008egny4r6huzkme	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.926	2026-07-12 14:37:52.943
cmrghucy600mmgny4losts9n9	bourse-esup-dakar-sante-formations-aux-m-tiers-param-d	Bourse Formations aux métiers paramédicaux (Santé)	cmrghuckg009tgny48q1wny5h	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.935	2026-07-12 14:37:52.96
cmrghucxv00logny40lerzehi	bourse-ipg-isti-dakar-bts-lectronique	Bourse Électronique (BTS)	cmrghucmv00dkgny4k7bf3y1f	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.924	2026-07-12 14:37:53.042
cmrghucxw00lsgny42rfj3s8p	bourse-ipg-isti-dakar-bts-lectrotechnique	Bourse Électrotechnique (BTS)	cmrghucmz00dqgny4g809dl29	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.925	2026-07-12 14:37:53.043
cmrghucxu00ligny4xqormegy	bourse-ipg-isti-dakar-bts-lectrom-canique	Bourse Électromécanique (BTS)	cmrghucn000dsgny4q5vadbqg	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.922	2026-07-12 14:37:53.044
cmrghucy500migny4g0hy26qv	bourse-smi-thies-licence-finance-comptabilit	Bourse Finance-Comptabilité (Licence)	cmrghucni00elgny4sizab3so	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.934	2026-07-12 14:37:53.057
cmrghucya00mwgny48jegxz18	bourse-ipd-thomas-sankara-licence-g-nie-civil	Bourse Génie Civil (Licence)	cmrghucj4008igny4wuylaerm	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.938	2026-07-12 12:54:04.762
cmrghucya00mygny4e5gu3yno	bourse-amdi-afrique-licence-g-nie-civil	Bourse Génie Civil (Licence)	cmrghuchf0056gny4l75enk7z	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.939	2026-07-12 12:54:04.762
cmrghucyh00nigny4v74d7te7	bourse-amdi-afrique-licence-g-omatique-terre-environnement	Bourse Géomatique-Terre-Environnement (Licence)	cmrghuchc0050gny4zso4soqa	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.945	2026-07-12 12:54:04.762
cmrghucyi00nmgny4gse28zfi	bourse-ipg-isti-dakar-licence-gestion	Bourse Gestion (Licence)	cmrghucn200dugny4xi7njn5d	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.947	2026-07-12 12:54:04.762
cmrghucyk00nsgny46cvfwz7s	bourse-ipd-thomas-sankara-licence-gestion-de-projet	Bourse Gestion de projet (Licence)	cmrghucjw008wgny4ldjiwzzy	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.948	2026-07-12 12:54:04.762
cmrghucyl00nygny4wxy4po04	bourse-isdb-dakar-licence-professionnelle-gestion-des-entreprises	Bourse Gestion des entreprises (Licence Professionnelle)	cmrghucfs001cgny4xpuvn2jt	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.95	2026-07-12 12:54:04.762
cmrghucym00o0gny4owp3dcjj	bourse-cefas-senegal-licence-gestion-des-entreprises	Bourse Gestion des entreprises (Licence)	cmrghuci5006ygny4hzb3afi3	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.951	2026-07-12 12:54:04.762
cmrghucz400p6gny43f6he5oe	bourse-ensup-afrique-dakar-licence-grh	Bourse GRH (Licence)	cmrghucld00b3gny4ynk6c363	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.968	2026-07-12 12:54:04.762
cmrghucz600pegny4s0bd8y64	bourse-afpa-dakar-bts-h-tellerie-restauration	Bourse Hôtellerie-Restauration (BTS)	cmrghucma00cggny47a4347cg	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.971	2026-07-12 12:54:04.762
cmrghucz700pggny4570qfbg0	bourse-isdb-dakar-licence-professionnelle-h-tellerie-tourisme	Bourse Hôtellerie-Tourisme (Licence Professionnelle)	cmrghucfu001igny4g7yqwgma	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.971	2026-07-12 12:54:04.762
cmrghucza00pqgny4o4j708hz	bourse-isdb-dakar-dt-dts-bep-bts-infographie	Bourse Infographie (DT/DTS/BEP/BTS)	cmrghucfq0016gny4aoez02pu	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.975	2026-07-12 14:37:52.844
cmrghucz900pmgny491i84eqi	bourse-amdi-afrique-dt-diplomes-sante-d-etat-infirmier-d-tat	Bourse Infirmier d'État (DT/Diplômes santé d'État)	cmrghuch6004mgny4e60hkqbi	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.973	2026-07-12 14:37:52.877
cmrghucyb00n2gny41v8w4pfz	bourse-amdi-afrique-licence-g-nie-lectrom-canique	Bourse Génie Électromécanique (Licence)	cmrghuche0052gny4m1rn1nty	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.94	2026-07-12 14:37:52.882
cmrghucy900mugny45rqrkdnx	bourse-ipd-thomas-sankara-bts-dts-g-nie-civil	Bourse Génie Civil (BTS/DTS)	cmrghuciy0082gny4731f6h6a	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.937	2026-07-12 14:37:52.94
cmrghucyb00n0gny4675wqrvs	bourse-esup-dakar-bts-dts-g-nie-lectrique	Bourse Génie Électrique (BTS/DTS)	cmrghuck9009hgny4v8ehr3it	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.939	2026-07-12 14:37:52.953
cmrghucyj00nqgny43vv236dn	bourse-ensup-afrique-dakar-licence-gestion-administrative-et-des	Bourse Gestion administrative et des collectivités (Licence)	cmrghucll00bdgny4odaoe446	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.948	2026-07-12 14:37:52.983
cmrghucz800pkgny4bdtxxuc8	bourse-elite-sante-diplomes-d-etat-infirmier-d-tat	Bourse Infirmier d'État (Diplômes d'État)	cmrghuclr00bqgny48isxi642	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.973	2026-07-12 14:37:52.988
cmrghucza00pogny41jd3k5za	bourse-elite-sante-specialisations-infirmier-de-bloc-op-ratoire	Bourse Infirmier de bloc opératoire (Spécialisations)	cmrghuclv00c0gny46574biwn	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.974	2026-07-12 14:37:53
cmrghuczb00psgny4jxgxsybn	bourse-smi-thies-bt-bts-dec-informatique	Bourse Informatique (BT/BTS/DEC)	cmrghucni00ejgny4s4ma5dpp	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.975	2026-07-12 14:37:53.055
cmrghuczc00pugny45fyd7sx2	bourse-ipg-isti-dakar-bts-informatique	Bourse Informatique (BTS)	cmrghucmw00dmgny44lwtoa6d	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.976	2026-07-12 12:54:04.762
cmrghuczf00q2gny4e01ecy5u	bourse-ipd-thomas-sankara-licence-informatique	Bourse Informatique (Licence)	cmrghucj00088gny42w9p7skt	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.98	2026-07-12 12:54:04.762
cmrghuczi00qagny4ejvcsmje	bourse-isdb-dakar-licence-professionnelle-informatique-de-gestion	Bourse Informatique de gestion (Licence Professionnelle)	cmrghucfx001qgny43f0zjhtx	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.982	2026-07-12 12:54:04.762
cmrghuczr00qogny4znrapoxv	bourse-ipg-isti-dakar-licence-ing-nierie	Bourse Ingénierie (Licence)	cmrghucn500e0gny4okxupzj6	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.991	2026-07-12 12:54:04.762
cmrghuczv00r0gny4ww8tqau0	bourse-cefas-senegal-licence-journalisme-et-communication	Bourse Journalisme et Communication (Licence)	cmrghucii0076gny476qpbeln	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.995	2026-07-12 12:54:04.762
cmrghud0000r2gny4jkx35c6x	bourse-amdi-afrique-licence-journalisme-et-communication	Bourse Journalisme et Communication (Licence)	cmrghuchk005igny4w8q2stn8	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.001	2026-07-12 12:54:04.762
cmrghud0200r4gny49l367lv0	bourse-hecm-dakar-licence-journalisme-et-information	Bourse Journalisme et information (Licence)	cmrghucgn003ggny4gmdv9vid	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.003	2026-07-12 12:54:04.762
cmrghud0400r6gny4rt2f9o4t	bourse-isdb-dakar-licence-professionnelle-journalisme-communication	Bourse Journalisme-Communication (Licence Professionnelle)	cmrghucfw001ogny44pbeay7r	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.004	2026-07-12 12:54:04.762
cmrghud0400r8gny4p07w4kzk	bourse-elite-sante-licence-licence-en-biologie-m-dicale	Bourse Licence en Biologie Médicale (Licence)	cmrghuclu00bygny4glk2i3mu	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.005	2026-07-12 12:54:04.762
cmrghuczf00q0gny4mnk4ijvq	bourse-ipd-thomas-sankara-bts-dts-informatique	Bourse Informatique (BTS/DTS)	cmrghuciw007ygny4o71wypnp	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.979	2026-07-12 14:37:52.937
cmrghuczd00pygny4x6lcxvk5	bourse-esup-dakar-bts-dts-informatique	Bourse Informatique (BTS/DTS)	cmrghuck4009bgny46lp9g8sg	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.977	2026-07-12 14:37:52.948
cmrghuczg00q4gny4w0tk556w	bourse-ifaa-dakar-bachelor-licence-informatique-de-gestion	Bourse Informatique de Gestion (Bachelor/Licence)	cmrghuckq00acgny42gxow6jg	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.98	2026-07-12 14:37:52.969
cmrghuczu00qygny48kt9tha4	bourse-img-rufisque-dts-bep-dep-journalisme-et-communication	Bourse Journalisme et Communication (DTS/BEP/DEP)	cmrghucm300cbgny4cln04hso	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.995	2026-07-12 14:37:53.005
cmrghuczh00q8gny40x03e4mh	bourse-isca-dakar-dt-du-dts-bts-bt-dut-certificat-deug-informatique-de-gestion	Bourse Informatique de Gestion (DT/DU/DTS/BTS/BT/DUT/Certificat/DEUG)	cmrghucmg00crgny4ro6iez40	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.981	2026-07-12 14:37:53.016
cmrghuczg00q6gny48q6yueor	bourse-isca-dakar-bachelor-licence-licence-professionnelle-informatique-de-gestion	Bourse Informatique de Gestion (Bachelor/Licence/Licence Professionnelle)	cmrghucmh00cvgny4nic2lbh9	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.981	2026-07-12 14:37:53.018
cmrghud0600regny4tv7wn05c	bourse-smi-thies-bt-bts-dec-logistique	Bourse Logistique (BT/BTS/DEC)	cmrghucnd00efgny4f8tu0tt0	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.006	2026-07-12 14:37:53.053
cmrghuczs00qqgny4bq9xqae8	bourse-smi-thies-licence-ing-nierie-des-syst-mes-r-se	Bourse Ingénierie des Systèmes & Réseaux (Licence)	cmrghucnn00exgny4paichk29	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.992	2026-07-12 14:37:53.058
cmrghuczu00qwgny47ncdglx4	bourse-img-mbour-complementaires-journalisme-et-communication	Bourse Journalisme et Communication (Complémentaires)	cmrghucou00g1gny4eyezll43	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:41.994	2026-07-12 14:37:53.095
cmrghud0500ragny4bg73ig9e	bourse-elite-sante-licence-licence-en-sciences-infirmi-re	Bourse Licence en Sciences infirmières (Licence)	cmrghuclt00bugny4uf8bwtym	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.005	2026-07-12 12:54:04.762
cmrghud0500rcgny4iyu073km	bourse-elite-sante-licence-licence-en-sciences-obst-trica	Bourse Licence en Sciences obstétricales (Licence)	cmrghuclu00bwgny4nrjouhuq	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.006	2026-07-12 12:54:04.762
cmrghud0k00signy48mj53tdh	bourse-ipd-thomas-sankara-licence-marketing	Bourse Marketing (Licence)	cmrghucjj008ogny48cnolcra	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.02	2026-07-12 12:54:04.762
cmrghud0o00sygny44pkmxnlz	bourse-isbd-dakar-licence-marketing-et-communication	Bourse Marketing et Communication (Licence)	cmrghuchw006dgny40nkax1bd	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.025	2026-07-12 12:54:04.762
cmrghud0q00t0gny4s6quhcfv	bourse-hecm-dakar-bts-marketing-et-communication-dig	Bourse Marketing et Communication Digitale (BTS)	cmrghucgl003agny4drswi7i0	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.026	2026-07-12 12:54:04.762
cmrghud0r00t2gny476sdpeg2	bourse-hecm-dakar-licence-marketing-et-communication-dig	Bourse Marketing et Communication Digitale (Licence)	cmrghucgo003igny47a0wjn8y	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.027	2026-07-12 12:54:04.762
cmrghud0r00t4gny4yl3rsie6	bourse-estg-dakar-licence-professionnelle-marketing-op-rationnel-et-acti	Bourse Marketing Opérationnel et Action Commerciale (Licence Professionnelle)	cmrghucga002jgny43h0gk1tt	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.028	2026-07-12 12:54:04.762
cmrghud0s00t6gny4hertw11j	bourse-isdb-dakar-licence-professionnelle-marketing-communication	Bourse Marketing-Communication (Licence Professionnelle)	cmrghucft001egny4eijfhsol	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.029	2026-07-12 12:54:04.762
cmrghud0x00t8gny4g9ryhzfo	bourse-abs-school-dakar-licence-marketing-communication	Bourse Marketing-Communication (Licence)	cmrghucgy0043gny41gsdbvn4	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.034	2026-07-12 12:54:04.762
cmrghud0y00tagny4xuwgkmcd	bourse-cefas-senegal-licence-marketing-communication	Bourse Marketing-Communication (Licence)	cmrghuci80072gny4mu7j5aub	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.034	2026-07-12 12:54:04.762
cmrghud1d00uegny41jmhb73n	bourse-hecm-dakar-licence-ressources-humaines	Bourse Ressources Humaines (Licence)	cmrghucgo003kgny4mhnr1zpl	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.049	2026-07-12 12:54:04.762
cmrghud1d00uggny4egyvv69x	bourse-isbd-dakar-licence-ressources-humaines	Bourse Ressources Humaines (Licence)	cmrghuchw006fgny4kaiuodqt	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.05	2026-07-12 12:54:04.762
cmrghud1f00ukgny44q6wp9hl	bourse-ipd-thomas-sankara-licence-rh	Bourse RH (Licence)	cmrghucji008mgny4way1rtzs	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.051	2026-07-12 12:54:04.762
cmrghud1h00uqgny4b2mpw1ec	bourse-amdi-afrique-dt-diplomes-sante-d-etat-sage-femme-d-tat	Bourse Sage-femme d'État (DT/Diplômes santé d'État)	cmrghuch7004ogny4hlvjb8f2	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.053	2026-07-12 14:37:52.877
cmrghud0j00segny47wop0iez	bourse-ifaa-dakar-bts-dts-marketing	Bourse Marketing (BTS/DTS)	cmrghuckl00a0gny4abujxxal	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.019	2026-07-12 14:37:52.963
cmrghud1c00ucgny4zqxjmpdn	bourse-ifaa-dakar-bachelor-licence-ressources-humaines	Bourse Ressources Humaines (Bachelor/Licence)	cmrghuckn00a6gny4invc7giy	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.048	2026-07-12 14:37:52.966
cmrghud0o00swgny4qukbsyjc	bourse-img-rufisque-dts-bep-dep-marketing-et-communication	Bourse Marketing et communication (DTS/BEP/DEP)	cmrghucm200c9gny4d33byra7	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.024	2026-07-12 14:37:53.004
cmrghud1e00uigny4g654mgab	bourse-img-mbour-complementaires-restauration	Bourse Restauration (Complémentaires)	cmrghucow00g5gny4tuk3xh68	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.051	2026-07-12 14:37:53.097
cmrghud1m00v4gny44dmnixpi	bourse-hecm-dakar-licence-services-de-transport-logistiq	Bourse Services de Transport/Logistique (Licence)	cmrghucgr003mgny47rgj1q70	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.058	2026-07-12 12:54:04.762
cmrghud1n00v6gny4irl5yo5p	bourse-amdi-afrique-licence-technologie-des-r-seaux-et-t-l	Bourse Technologie des réseaux et télécommunications (Licence)	cmrghuchh005agny4xei2aafz	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.06	2026-07-12 12:54:04.762
cmrghud1q00vegny404nwrnz6	bourse-afpa-dakar-bts-tourisme	Bourse Tourisme (BTS)	cmrghucmb00cigny4sq5kvtuj	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.063	2026-07-12 12:54:04.762
cmrghud1r00vggny4if3lolo4	bourse-ipd-thomas-sankara-licence-transit	Bourse Transit (Licence)	cmrghucjz0092gny46g0nowtb	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.064	2026-07-12 12:54:04.762
cmrghud1s00vkgny4rm8jhf9l	bourse-ipd-thomas-sankara-licence-transport	Bourse Transport (Licence)	cmrghucjy0090gny49yml29ps	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.065	2026-07-12 12:54:04.762
cmrghud1t00vmgny4ndnc9wto	bourse-img-mbour-bep-transport-logistique	Bourse Transport logistique (BEP)	cmrghucop00frgny43khnxk5r	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.065	2026-07-12 12:54:04.762
cmrghud1u00vogny4301tbebm	bourse-img-mbour-dep-transport-logistique	Bourse Transport logistique (DEP)	cmrghucor00fxgny4f55nhbxw	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.066	2026-07-12 12:54:04.762
cmrghud1x00vygny43ykvu00w	bourse-isbd-dakar-licence-transport-logistique	Bourse Transport Logistique (Licence)	cmrghuchx006hgny4kzqf3yjq	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.07	2026-07-12 12:54:04.762
cmrghud1y00w2gny46yjgfdtb	bourse-ensup-afrique-dakar-bts-transport-logistique	Bourse Transport-Logistique (BTS)	cmrghucl700axgny424w5a5xa	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.071	2026-07-12 12:54:04.762
cmrghud2100wagny4hur68q9c	bourse-esup-dakar-licence-transport-logistique	Bourse Transport-Logistique (Licence)	cmrghuckd009pgny4kijh0ac8	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.074	2026-07-12 12:54:04.762
cmrghud1p00vagny4szf4nui7	bourse-hecm-dakar-licence-technologies-de-l-information	Bourse Technologies de l'Information et de la Communication (TIC) (Licence)	cmrghucgs003ogny4uq2a47xl	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.061	2026-07-12 14:37:52.87
cmrghud1k00uygny4gs3ww6ov	bourse-amdi-afrique-dt-diplomes-sante-d-etat-secr-taire-m-dicale	Bourse Secrétaire médicale (DT/Diplômes santé d'État)	cmrghuch9004ugny4019ag5pb	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.056	2026-07-12 14:37:52.881
cmrghud1z00w4gny4deqzs1sn	bourse-ipd-thomas-sankara-bts-dts-transport-logistique	Bourse Transport-Logistique (BTS/DTS)	cmrghuciz0086gny4w2zfb4j3	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.072	2026-07-12 14:37:52.942
cmrghud1p00vcgny4h629xfj3	bourse-esup-dakar-bts-dts-t-l-communications	Bourse Télécommunications (BTS/DTS)	cmrghuck5009dgny4llecamxu	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.062	2026-07-12 14:37:52.95
cmrghud2000w6gny4i8ckns57	bourse-ifaa-dakar-bts-dts-transport-logistique	Bourse Transport-Logistique (BTS/DTS)	cmrghuckm00a4gny4seuhjyqm	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.072	2026-07-12 14:37:52.965
cmrghud1l00v2gny4n87yrn75	bourse-essem-sante-mbour-diplomes-certifications-secr-tariat-m-dical	Bourse Secrétariat médical (Diplômes/certifications)	cmrghucog00f6gny4b4ovdyub	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.058	2026-07-12 14:37:53.063
cmrghud1j00uwgny4u5wpdj2r	bourse-essem-sante-mbour-licence-sciences-infirmi-res-param-d	Bourse Sciences infirmières / paramédicales (Licence)	cmrghucol00fggny48n3iyuoq	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.056	2026-07-12 14:37:53.09
cmrghud1i00uugny4t7archw7	bourse-img-mbour-complementaires-sant	Bourse Santé (Complémentaires)	cmrghucov00g3gny4bi2niv1x	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.055	2026-07-12 14:37:53.096
cmrghud2200wcgny4hakbxex7	bourse-cefas-senegal-licence-transport-logistique	Bourse Transport-Logistique (Licence)	cmrghuci90074gny4cz29ks46	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.074	2026-07-12 12:54:04.762
cmrghud2300wegny4i7hbjx0l	bourse-abs-school-dakar-licence-transport-logistique	Bourse Transport-Logistique (Licence)	cmrghuch2004bgny46d74r7z9	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.075	2026-07-12 12:54:04.762
cmrghud2500wggny4vx546ja0	bourse-amdi-afrique-licence-transport-logistique	Bourse Transport-Logistique (Licence)	cmrghuchm005mgny44k4md2zv	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.077	2026-07-12 12:54:04.762
cmrghud2a00wmgny44oar3m2n	bourse-amdi-afrique-dt-diplomes-sante-d-etat-vendeur-en-pharmacie	Bourse Vendeur en Pharmacie (DT/Diplômes santé d'État)	cmrghuch8004qgny48el3gc8u	cmrghoxmf0000gnzbjfp0btij	100	\N	20	0	2026-12-31 23:59:59	Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.	CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.	t	2026-07-11 15:02:42.082	2026-07-12 14:37:52.879
\.


--
-- Data for Name: Candidature; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Candidature" (id, "userId", "programmeId", "partnerId", "firstName", "lastName", "fullName", email, phone, address, institution, field, level, "lastEducationLevel", "lastDiploma", "graduationDate", gpa, "targetProgram", status, "documentUrl", "documentIssuedAt", "identityCardRectoUrl", "identityCardVersoUrl", "createdAt", "bourseId", "bacTranscriptUrl", "bfemAttestationUrl") FROM stdin;
cmrhyo8gf0001gnpub940s9de	cmrhubklb0000gnv47keig422	cmrghuclj00b9gny4qugalac8	cmrghoxmf0000gnzbjfp0btij	SEynabou	DIeng	SEynabou DIeng	zeynash1@gmail.com	777777777	Dakar	ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration	Administration des biens et Gestion immobilière (Licence)	Licence	BAc	BAc		23	Administration des biens et Gestion immobilière (Licence)	EN_ATTENTE_PAIEMENT	\N	\N	/uploads/users/cmrhubklb0000gnv47keig422/cni-recto.jpg	/uploads/users/cmrhubklb0000gnv47keig422/cni-verso.jpg	2026-07-12 15:41:35.823	cmrghucvt00gugny4ry3gtogo	/uploads/users/cmrhubklb0000gnv47keig422/bac.jpg	/uploads/users/cmrhubklb0000gnv47keig422/bfem.jpg
cmrmp5nqe000wjla93eyu8nrv	cmrmodbq0000qjla94wiyn9cz	cmrghuclj00b9gny4qugalac8	cmrghoxmf0000gnzbjfp0btij	ndeya	nnn	ndeya nnn	test@tesndeeet.sn	776333333333	Dakar	ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration	Administration des biens et Gestion immobilière (Licence)	Licence	Bac	Bac		23	Administration des biens et Gestion immobilière (Licence)	EN_ATTENTE_PAIEMENT	\N	\N	/uploads/users/cmrmodbq0000qjla94wiyn9cz/cni-recto.jpg	/uploads/users/cmrmodbq0000qjla94wiyn9cz/cni-verso.jpg	2026-07-15 23:14:03.492	cmrghucvt00gugny4ry3gtogo	/uploads/users/cmrmodbq0000qjla94wiyn9cz/bac.pdf	/uploads/users/cmrmodbq0000qjla94wiyn9cz/bfem.pdf
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."ContactMessage" (id, "senderName", email, subject, message, "createdAt") FROM stdin;
\.


--
-- Data for Name: Etablissement; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Etablissement" (id, slug, nom, ville, accreditation, site, resume, "coverImageUrl", "logoUrl", "typeLabel") FROM stdin;
cmrghuce00001gny4nx5v3dvb	imtech-nelson-mandela	IMTECH — Institut de Management et de Technologie Nelson Mandela	Dakar	\N	imtech-nelsonmandela.com	Institut de Management et Technologie situé à Rond-point Castor x Avenue Bourguiba, Dakar. Contact: 33 825 58 21	https://www.sencampus.com/api/media/file/imtech-nelson-mandela-1.jpg	\N	Institut de Management et Technologie
cmrghucfk000wgny42j1f4mfk	isdb-dakar	ISDB — Institut Supérieur Dakar Banlieue	Dakar	\N	isdb.sn	Institut Supérieur situé à Parcelles Assainies Unité 6 N°518, à côté du Lycée des Parcelles Assainies (LPA) et station Shell, Dakar. Contact: 77 544 52 41	https://www.sencampus.com/api/media/file/isdb-institut-superieur-de-formation.webp	https://www.sencampus.com/api/media/file/isdb.jpg	Institut Supérieur
cmrghucg20023gny4vvjzdzva	estg-dakar	ESTG — École Supérieure des Techniques de Gestion	Dakar	\N	estg.sn	École Supérieure de Gestion situé à Sicap/Liberté 4, Lot 5001, Dakar (côté camp des sapeurs-pompiers). 	https://www.sencampus.com/api/media/file/ESTG-ecole-superieur-des-techniques-de-gestions.jpg	https://www.sencampus.com/api/media/file/logo-estg-ecole-superieure-des-techniques-de-gestion.jpg	École Supérieure de Gestion
cmrghucgj0036gny4kxqwskcn	hecm-dakar	HECM — Espace HECM – Hautes Études de Coaching et de Management	Dakar	\N	hecm-dakar.com	École de Coaching et Management situé à Liberté 4, Allées Khalifa Ababacar Sy, villa 5015, Dakar (près du camp des sapeurs-pompiers). Contact: 33 843 55 39	\N	\N	École de Coaching et Management
cmrghucgx003xgny493y1lt7l	abs-school-dakar	ABS School — African Business School	Dakar	\N	abs-ao.com	Business School situé à Sicap Liberté 2, derrière le rond-point Jet d'Eau, villa n°1589, Dakar. Contact: 77 123 41 41	\N	\N	Business School
cmrghuch6004kgny4f7a46uua	amdi-afrique	AMDI — African Millennium Development Institute (AMDI Afrique)	Dakar	\N	amdiafrique.com	Institut de Développement situé à VDN, Liberté 6 Extension villa n°05, en face du cimetière Saint-Lazare de Béthanie, Dakar. Contact: 33 825 72 32	https://www.sencampus.com/api/media/file/amdi-afrique-sencampus-thumbnail.webp	\N	Institut de Développement
cmrghuchv0069gny4dqtpl3n1	isbd-dakar	ISBD — International School of Business and Development	Dakar	\N	isbd-school.com	Business School situé à Mermoz, ancienne piste, Dakar. 	https://www.sencampus.com/api/media/file/isbd-international-school-of-business-and-development-thumbnail.webp	https://www.sencampus.com/api/media/file/isbd.jpg	Business School
cmrghuchz006kgny4zj46lbbn	cefas-senegal	CEFAS — Centre de Formation Africain du Sénégal	Dakar	\N	cefas-senegal.com	Centre de Formation situé à Cité Keur Damel, en face de Yenguoulène, avant le rond-point 26 des Parcelles Assainies, Dakar. Contact: 77 868 57 27	https://www.sencampus.com/api/media/file/cefas-sencampus-thumbnail.webp	\N	Centre de Formation
cmrghuciq007hgny4053u1lsg	sup-immo-dakar	SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier	Dakar	\N	groupesupimmo.com	École de l'Immobilier situé à Liberté 6 Extension, en face de la pharmacie Leclerc, Dakar. Contact: 78 222 90 90	\N	\N	École de l'Immobilier
cmrghuciw007wgny4ybtbw7ur	ipd-thomas-sankara	IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara »	Dakar	\N	ipd.sn	Institut Polytechnique situé à N°8477, Sud Foire, Dakar (près du SAMU municipal). Contact: 33 867 90 45	\N	\N	Institut Polytechnique
cmrghuck20097gny4cl3dq6cb	esup-dakar	ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé)	Dakar	\N	esupdakar.sn	Groupe d'enseignement supérieur situé à Sacré-Cœur III, villas N°9256/9255, VDN, Dakar. Contact: 33 867 07 90	\N	\N	Groupe d'enseignement supérieur
cmrghucki009ugny4ntnmakol	ifaa-dakar	IFAA — Institut de Formation en Administration des Affaires	Dakar	\N	ifaa.sn	Institut de Formation situé à Cité SIPRES 2, face VDN, villa n°2, Dakar (annexe Parcelles Assainies). Contact: 33 867 36 35	\N	\N	Institut de Formation
cmrghuckx00apgny4l4214v0c	ensup-afrique-dakar	ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration	Dakar	\N	ensupafrique.com	École Supérieure situé à Liberté 6 Extension, villa n°205, en face du Camp Leclerc, Dakar. 	\N	\N	École Supérieure
cmrghuclq00bmgny4c838ysv4	elite-sante	Élite Santé — Institut Élite Santé (IES)	Keur Massar	\N	groupelitesante.com	Institut de Santé situé à Keur Massar (Aïnoumadi) ; campus à Pikine/Guédiawaye, Avenue Bourguiba, Thiès, Kaolack, Touba. 	\N	\N	Institut de Santé
cmrghuclx00c3gny4w508cjpo	img-rufisque	IMG (Rufisque) — Institut de Management et de Gestion	Rufisque	\N	groupe-img.com	Institut de Management situé à Rufisque, Cité Santé Yalla, près du rond-point Socabeg, Lot 9591. Contact: 33 836 62 42	\N	\N	Institut de Management
cmrghucm600cegny4851cg44l	afpa-dakar	AFPA — Africaine des Formations Professionnelles en Alternance	Colobane	\N	afpa.sn	Formation Professionnelle situé à Colobane, Dakar. 	\N	\N	Formation Professionnelle
cmrghucmf00cpgny4ley54whc	isca-dakar	ISCA — Institut Supérieur de Commerce et d'Administration des Affaires	Dakar	\N	isca.sn	Institut Supérieur situé à Avenue Bourguiba, à 25m du Crédit Mutuel de Castors, face au jardin de Dieuppeul II, Dakar. Contact: 33 825 02 03	\N	\N	Institut Supérieur
cmrghucmu00digny4yb5pc1ch	ipg-isti-dakar	IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle	Dakar	\N	ipg-isti.sn	Groupe d'Instituts situé à Sicap Sacré-Cœur 2, Immeuble IPG-ISTI, BP 10155, Dakar (2ᵉ site Almadies). 	\N	\N	Groupe d'Instituts
cmrghucn800e5gny43qgrus3k	smi-thies	SMI — Sup'Management Intelligentsia	Thiès	\N	smi.sn	École de Management situé à Cité Malick Sy, derrière la station Titan Oil, Thiès (siège aussi Dakar Point E ; campus Ziguinchor). Contact: 33 951 66 62	\N	\N	École de Management
cmrghucog00f4gny4qa02nt7y	essem-sante-mbour	Essem / ESEM Santé (Mbour) — Institut de formation santé	Mbour	\N	\N	Institut de Santé situé à Croisement Saly, Mbour. 	\N	\N	Institut de Santé
cmrghucol00fhgny4zuos2xh6	img-mbour	IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour	Mbour	\N	imgmbour.com	Institut de Management situé à Après l'agence Free de Mbour, intersection LDD (ex-IMG). 	\N	\N	Institut de Management
cmrghucow00g6gny4sjohkr7n	ensup-afrique-mbour	ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour	Mbour	\N	ensupafrique.com	École Supérieure situé à Croisement Saly, Mbour. 	\N	\N	École Supérieure
\.


--
-- Data for Name: FaqItem; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."FaqItem" (id, "sortOrder", published, question, answer) FROM stdin;
cmrghud2s00wngny44fav3mij	0	t	Qui finance les bourses ?	Les bourses sont financées par des partenaires institutionnels : mairies, agences régionales et bailleurs publics. Chaque fiche bourse indique le partenaire financeur et ses conditions.
cmrghud2s00wogny4ag5qdjy4	1	t	Comment récupérer mon attestation ?	Une fois votre candidature acceptée et le document émis par le bailleur, l'attestation est disponible au téléchargement depuis votre espace étudiant, section Mes documents.
cmrghud2s00wpgny4m75qq9k4	2	t	Puis-je postuler à plusieurs bourses ?	Oui, vous pouvez déposer plusieurs candidatures si les conditions de chaque bourse le permettent. Chaque dossier est suivi séparément dans votre tableau de bord.
cmrghud2s00wqgny41a0z3cli	3	t	Les frais sont-ils remboursables ?	Les frais de dossier et les règles de remboursement sont précisés sur la fiche de chaque bourse et par le partenaire financeur avant le paiement.
cmrghud2s00wrgny4lucurad9	4	t	Comment se fait le paiement ?	Les frais de dossier, lorsqu'ils s'appliquent, se règlent en ligne par Mobile Money (Orange Money, Wave) depuis votre espace candidat, après validation du formulaire.
cmrghud2s00wsgny4btci6usd	5	t	Que couvre la bourse ?	Chaque bourse indique un pourcentage de couverture (25 %, 50 %, 75 % ou 100 %) des frais de scolarité. Le reste à charge et le montant pris en charge sont affichés avant toute candidature.
\.


--
-- Data for Name: MetierPage; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."MetierPage" (id, slug, "sortOrder", published, label, "shortDescription", salary, employability, "salaryNote", missions, skills, career, "coverImageUrl", "updatedAt") FROM stdin;
cmrghud2y00wwgny4vj8ap05y	dev-web	0	t	Développement Web	Concevoir des applications et sites performants, du front au back, avec des stacks recherchées par les entreprises et startups.	350 000 – 1 500 000 FCFA	Très élevée	Fourchettes indicatives (Dakar et grandes villes) ; varie selon entreprise et expérience.	["Concevoir et maintenir des interfaces et API au service des utilisateurs.", "Collaborer avec produit et design sur des cycles de livraison courts.", "Assurer qualité, sécurité de base et performance des services web."]	["JavaScript / TypeScript", "Frameworks web", "API REST", "Git", "Tests"]	[{"text": "Développement de features guidé, montée en stack technique.", "level": "Junior"}, {"text": "Autonomie sur modules, mentors des plus juniors.", "level": "Confirmé"}, {"text": "Architecture, choix techniques et coordination équipe.", "level": "Lead"}]	https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80	2026-07-11 15:02:42.106
cmrghud2y00wxgny4ik3n981w	cybersecurite	1	t	Cybersécurité	Protéger les systèmes et données : audit, détection d'incidents et conformité dans un contexte de digitalisation accrue.	550 000 – 2 200 000 FCFA	Très élevée	Demande forte dans banques, opérateurs et grandes structures.	["Analyser la surface d'attaque et les politiques de sécurité.", "Surveiller les incidents et répondre aux alertes (SOC).", "Contribuer à la conformité et à la sensibilisation des utilisateurs."]	["Réseau", "SSI", "Gestion des vulnérabilités", "Normes et réglementation", "Forensic (bases)"]	[{"text": "Tâches de supervision et documentation sécurité.", "level": "Junior"}, {"text": "Audits, durcissement et projets transverses.", "level": "Confirmé"}, {"text": "Stratégie sécurité, architecture et pilotage des risques.", "level": "Senior"}]	https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80	2026-07-11 15:02:42.106
cmrghud2y00wygny4yjbsywp4	data-science	2	t	Data Science	Transformer les données en décisions : modélisation, visualisation et indicateurs pour la finance, la santé et le retail.	500 000 – 2 000 000 FCFA	Élevée	Intersection forte avec la finance et la conformité (scoring, fraude).	["Préparer et explorer les jeux de données.", "Construire des modèles prédictifs et des tableaux de bord.", "Traduire les résultats pour les métiers et la direction."]	["Python", "SQL", "Statistiques", "Machine learning", "Visualisation"]	[{"text": "Requêtes, reporting, soutien aux analyses.", "level": "Junior"}, {"text": "Modèles, expérimentation et mise en production encadrée.", "level": "Confirmé"}, {"text": "Feuille de route data, gouvernance et projets structurants.", "level": "Senior"}]	https://images.unsplash.com/photo-1551288049-bebda4e38c71?auto=format&fit=crop&w=900&q=80	2026-07-11 15:02:42.106
cmrghud2y00wzgny4rod88ajv	ia	3	t	Intelligence artificielle	Automatisation, NLP et vision : compétences rares pour la recherche, les banques et les projets scale-up.	600 000 – 2 500 000 FCFA	Élevée	Profils recherchés ; préparer un socle solide en math et programmation.	["Concevoir et entraîner des modèles adaptés au contexte métier.", "Intégrer l'IA dans des produits et processus existants.", "Évaluer risques, biais et performances des systèmes."]	["ML / deep learning", "NLP ou vision", "MLOps (bases)", "Mathématiques", "Python"]	[{"text": "Expérimentation, jeux de données et prototypage.", "level": "Junior"}, {"text": "Projets IA de bout en bout avec les équipes métier.", "level": "Confirmé"}, {"text": "Innovation, stratégie IA et partenariats techniques.", "level": "Senior"}]	https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80	2026-07-11 15:02:42.106
cmrghud2y00x0gny477x3vuok	marketing-digital	4	t	Marketing digital	Acquisition, contenus et performance : piloter la présence en ligne des marques locales et internationales.	300 000 – 1 200 000 FCFA	Élevée	Très lié au secteur (agence, retail, fintech, médias).	["Définir et piloter campagnes et contenus multicanal.", "Mesurer la performance (analytics, CRM).", "Collaborer avec commercial et produit sur la croissance."]	["Stratégie digitale", "Réseaux sociaux", "SEO / SEA", "Analytics", "Rédaction"]	[{"text": "Exécution de campagnes et reporting.", "level": "Junior"}, {"text": "Stratégie de funnel et budgets médias.", "level": "Confirmé"}, {"text": "Positionnement marque et leadership marketing.", "level": "Senior"}]	https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80	2026-07-11 15:02:42.106
cmrghud2y00x1gny4g7ub43ok	finance	5	t	Finance & banque	Crédit, risques, conformité et fintech : métiers stables avec forte demande dans la zone UEMOA.	400 000 – 2 000 000 FCFA	Élevée	Inclut des trajectoires type analyste risque / quant en environnement bancaire ou fintech.	["Analyser risque, crédit et performance financière.", "Contribuer à la conformité et au pilotage réglementaire (BCEAO, audits).", "Soutenir produits digitaux (mobile money, inclusion financière)."]	["Excel / outils quant", "Comptabilité & finance", "Réglementation", "SQL (souvent)", "Communication"]	[{"text": "Suivi portefeuille, reporting et analyses de base.", "level": "Junior"}, {"text": "Modélisation risque, projets transverses ; rôle proche de l'analyse quant / risque.", "level": "Confirmé"}, {"text": "Gouvernance risque, comités et pilotage stratégique.", "level": "Senior"}]	https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80	2026-07-11 15:02:42.106
cmrghud2y00x2gny44ist6yo5	sante	6	t	Santé & sciences	Santé publique, laboratoire, imagerie et gestion hospitalière : secteur en structuration et recrutement continu.	350 000 – 1 800 000 FCFA	Modérée à élevée	Très dépendant du sous-secteur (public, privé, recherche).	["Contribuer aux programmes de santé publique ou à la recherche appliquée.", "Coordonner données, qualité et suivi de projets sanitaires.", "S'adapter aux bailleurs et au secteur institutionnel."]	["Méthodologie", "Biostatistiques (selon filière)", "Régulation santé", "Gestion de projet", "Langage professionnel"]	[{"text": "Terrain, laboratoire ou appui administratif technique.", "level": "Junior"}, {"text": "Projets programmatiques et partenariats (ONG, État).", "level": "Confirmé"}, {"text": "Pilotage de dispositifs et influence sur les politiques locales.", "level": "Senior"}]	https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=900&q=80	2026-07-11 15:02:42.106
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Notification" (id, "userId", type, title, body, "readAt", "candidatureId", "bourseId", "createdAt") FROM stdin;
cmrhyo8gu0003gnpufak6idc5	cmrhubklb0000gnv47keig422	candidature_submitted	Candidature déposée	Votre demande de bourse pour Administration des biens et Gestion immobilière (Licence) a été enregistrée.	\N	cmrhyo8gf0001gnpub940s9de	cmrghucvt00gugny4ry3gtogo	2026-07-12 15:41:35.838
cmrmp5nrc000yjla908v2hpgr	cmrmodbq0000qjla94wiyn9cz	candidature_submitted	Candidature déposée	Votre demande de bourse pour Administration des biens et Gestion immobilière (Licence) a été enregistrée.	\N	cmrmp5nqe000wjla93eyu8nrv	cmrghucvt00gugny4ry3gtogo	2026-07-15 23:14:03.529
\.


--
-- Data for Name: Paiement; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Paiement" (id, "userId", "candidatureId", "fullName", email, phone, method, amount, "amountPartner", "amountPlatform", currency, status, "createdAt", provider, "refCommand", token) FROM stdin;
cmrhyo9pg0007gnpu292namf3	cmrhubklb0000gnv47keig422	cmrhyo8gf0001gnpub940s9de	SEynabou DIeng	zeynash1@gmail.com	777777777	PayTech	20000	15000	5000	FCFA	EN_ATTENTE	2026-07-12 15:41:37.444	paytech	BF_1783961861989_0f31b0f0	eey3kpmrjgtyxp
cmrmp5q0n0012jla956y5ct9x	cmrmodbq0000qjla94wiyn9cz	cmrmp5nqe000wjla93eyu8nrv	ndeya nnn	test@tesndeeet.sn	776333333333	PayTech	20000	15000	5000	FCFA	EN_ATTENTE	2026-07-15 23:14:06.455	paytech	BF_1784157246451_8ce14caa	405gztpmrmp5qfr
\.


--
-- Data for Name: Partner; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Partner" (id, name, slug, "logoUrl", "contactEmail", "partnerSharePercent", "createdAt", conditions, description) FROM stdin;
cmrghoxmf0000gnzbjfp0btij	BourseFi - Partenaire Principal	boursefi-partenaire	\N	contact@boursefi.sn	75	2026-07-11 14:58:28.791	Résidence sénégalaise requise. Dossier complet avant date limite.	Partenaire principal pour les bourses d'études au Sénégal
\.


--
-- Data for Name: Programme; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Programme" (id, slug, "etablissementId", "partnerId", titre, ville, duree, "fraisDossier", devise, niveau, placement, description, eligibilite, "brochureUrl", perspectives, "fraisDossierEtranger") FROM stdin;
cmrghucfb000hgny4ngnxclau	imtech-nelson-mandela-licence-management-international	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Management International (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Management International à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfb000jgny4opldcete	imtech-nelson-mandela-licence-banque-assurance	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Banque-Assurance (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Banque-Assurance à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfg000rgny480wie0ov	imtech-nelson-mandela-master-finance-et-gestion-d-entrepris	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Finance et Gestion d'Entreprises (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Finance et Gestion d'Entreprises à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfi000tgny4muqmarb7	imtech-nelson-mandela-master-technologies-de-l-information	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Technologies de l'Information (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Technologies de l'Information à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucf20005gny41rve6zlb	imtech-nelson-mandela-bts-dt-g-nie-civil	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Génie Civil (BTS/DT)	Dakar	Variable	20000	FCFA	BTS/DT	\N	Formation en Génie Civil à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucf40007gny41b3zp7ot	imtech-nelson-mandela-bts-dt-lectrom-canique	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Électromécanique (BTS/DT)	Dakar	Variable	20000	FCFA	BTS/DT	\N	Formation en Électromécanique à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucf60009gny42c4yvao3	imtech-nelson-mandela-bts-dt-informatique	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Informatique (BTS/DT)	Dakar	Variable	20000	FCFA	BTS/DT	\N	Formation en Informatique à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucf7000bgny49dzoedeh	imtech-nelson-mandela-bts-dt-marketing	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Marketing (BTS/DT)	Dakar	Variable	20000	FCFA	BTS/DT	\N	Formation en Marketing à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucf9000dgny4442ic5ro	imtech-nelson-mandela-bts-dt-logistique	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Logistique (BTS/DT)	Dakar	Variable	20000	FCFA	BTS/DT	\N	Formation en Logistique à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfa000fgny4o7gkgx01	imtech-nelson-mandela-bts-dt-comptabilit	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Comptabilité (BTS/DT)	Dakar	Variable	20000	FCFA	BTS/DT	\N	Formation en Comptabilité à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfc000lgny4v03gq1ed	imtech-nelson-mandela-licence-comptabilit-contr-le-audit-c	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Contrôle-Audit (CCA) (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Comptabilité-Contrôle-Audit (CCA) à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfd000ngny4kjg63vcb	imtech-nelson-mandela-licence-lectronique-lectrotechnique	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Électronique-Électrotechnique-Automatique (EEA) (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Électronique-Électrotechnique-Automatique (EEA) à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucff000pgny4v50dtigq	imtech-nelson-mandela-licence-marketing-tudes	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Marketing/Études (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing/Études à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfj000vgny4nm69d341	imtech-nelson-mandela-master-innovation-et-responsabilit-s	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Innovation et Responsabilité Sociétale (RSE) (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Innovation et Responsabilité Sociétale (RSE) à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfl000ygny4lshorulr	isdb-dakar-dt-dts-bep-bts-transit-douane-2-ans	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Transit douane (2 ans) (DT/DTS/BEP/BTS)	Dakar	Variable	20000	FCFA	DT/DTS/BEP/BTS	\N	Formation en Transit douane (2 ans) à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfm0010gny4t87bpbt6	isdb-dakar-dt-dts-bep-bts-h-tellerie-restauration-2-ans	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Hôtellerie-restauration (2 ans) (DT/DTS/BEP/BTS)	Dakar	Variable	20000	FCFA	DT/DTS/BEP/BTS	\N	Formation en Hôtellerie-restauration (2 ans) à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfr0018gny4fluz37rd	isdb-dakar-licence-professionnelle-droit-des-affaires	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Droit des affaires (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Droit des affaires à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfs001agny47ly16utd	isdb-dakar-licence-professionnelle-transport-logistique	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Transport Logistique (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Transport Logistique à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfs001cgny4xpuvn2jt	isdb-dakar-licence-professionnelle-gestion-des-entreprises	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Gestion des entreprises (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Gestion des entreprises à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucft001egny4eijfhsol	isdb-dakar-licence-professionnelle-marketing-communication	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Marketing-Communication (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Marketing-Communication à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfu001ggny4oq9lglmt	isdb-dakar-licence-professionnelle-banque-finance-assurance	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Banque-Finance-Assurance à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfu001igny4g7yqwgma	isdb-dakar-licence-professionnelle-h-tellerie-tourisme	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Hôtellerie-Tourisme (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Hôtellerie-Tourisme à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfw001mgny48ulunl1r	isdb-dakar-licence-professionnelle-grh	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	GRH (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en GRH à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfw001ogny44pbeay7r	isdb-dakar-licence-professionnelle-journalisme-communication	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Journalisme-Communication (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Journalisme-Communication à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfx001qgny43f0zjhtx	isdb-dakar-licence-professionnelle-informatique-de-gestion	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Informatique de gestion (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Informatique de gestion à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfy001sgny4ioda5y9v	isdb-dakar-licence-professionnelle-informatique-r-seaux	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Informatique réseaux (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Informatique réseaux à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfz001wgny46ejg7rdi	isdb-dakar-master-gestion-et-am-nagement-urbains	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Gestion et aménagement urbains (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Gestion et aménagement urbains à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg0001ygny4o66w6lhw	isdb-dakar-master-marketing-communication	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Marketing-Communication (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Marketing-Communication à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfp0014gny4d8ojq5vr	isdb-dakar-dt-dts-bep-bts-secr-tariat-bureautique-inform	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Secrétariat bureautique informatique (DT/DTS/BEP/BTS)	Dakar	Variable	20000	FCFA	DT/DTS/BEP/BTS	\N	Formation en Secrétariat bureautique informatique à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfq0016gny4aoez02pu	isdb-dakar-dt-dts-bep-bts-infographie	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Infographie (DT/DTS/BEP/BTS)	Dakar	Variable	20000	FCFA	DT/DTS/BEP/BTS	\N	Formation en Infographie à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfv001kgny4aocvtpnr	isdb-dakar-licence-professionnelle-comptabilit-gestion	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Comptabilité-Gestion à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfz001ugny4nce7z9o0	isdb-dakar-master-gestion-de-projets-et-syst-me	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Gestion de projets et Système d'Information (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Gestion de projets et Système d'Information à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg10022gny4k1urzotx	isdb-dakar-master-gestion-des-services-sanitaire	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Gestion des services sanitaires et sociaux (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Gestion des services sanitaires et sociaux à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg8002bgny4dxlcmh7t	estg-dakar-licence-professionnelle-gestion-financi-re-et-comptabl	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Gestion Financière et Comptable (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Gestion Financière et Comptable à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg8002dgny41r771w7u	estg-dakar-licence-professionnelle-achats-et-logistique	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Achats et Logistique (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Achats et Logistique à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg9002fgny48f3elu5p	estg-dakar-licence-professionnelle-transport-logistique	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Transport Logistique (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Transport Logistique à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucga002jgny43h0gk1tt	estg-dakar-licence-professionnelle-marketing-op-rationnel-et-acti	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Marketing Opérationnel et Action Commerciale (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Marketing Opérationnel et Action Commerciale à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgb002lgny4b40c7jx0	estg-dakar-licence-professionnelle-assistanat-de-gestion	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Assistanat de Gestion (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Assistanat de Gestion à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgb002ngny4dz4ynsr5	estg-dakar-licence-professionnelle-banque-finance-assurance	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Banque-Finance-Assurance à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgc002pgny4z0y348st	estg-dakar-licence-professionnelle-grh	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	GRH (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en GRH à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgd002rgny42gefzgdv	estg-dakar-licence-professionnelle-commerce-international	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Commerce International (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Commerce International à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucge002tgny40470wz04	estg-dakar-master-professionnel-marketing-communication	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Marketing-Communication (Master Professionnel)	Dakar	Variable	20000	FCFA	Master Professionnel	\N	Formation en Marketing-Communication à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgf002vgny4gkc0kffo	estg-dakar-master-professionnel-communication-et-marketing-num	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Communication et Marketing Numérique (Master Professionnel)	Dakar	Variable	20000	FCFA	Master Professionnel	\N	Formation en Communication et Marketing Numérique à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg50025gny472mw7ch9	estg-dakar-bts-bachelor-audit-et-contr-le-de-gestion	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Audit et Contrôle de Gestion (BTS/Bachelor)	Dakar	Variable	20000	FCFA	BTS/Bachelor	\N	Formation en Audit et Contrôle de Gestion à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg60027gny4q7zb2x9i	estg-dakar-bts-bachelor-communication-et-publicit	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Communication et Publicité (BTS/Bachelor)	Dakar	Variable	20000	FCFA	BTS/Bachelor	\N	Formation en Communication et Publicité à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg70029gny44m4inwv1	estg-dakar-bts-bachelor-banque-finance-assurance	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (BTS/Bachelor)	Dakar	Variable	20000	FCFA	BTS/Bachelor	\N	Formation en Banque-Finance-Assurance à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucga002hgny471g4m9c6	estg-dakar-licence-professionnelle-communication-et-publicit	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Communication et Publicité (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Communication et Publicité à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgg002xgny41w3jl747	estg-dakar-master-professionnel-gestion-des-ressources-humaine	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Gestion des Ressources Humaines (Master Professionnel)	Dakar	Variable	20000	FCFA	Master Professionnel	\N	Formation en Gestion des Ressources Humaines à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgg002zgny4r858bw3v	estg-dakar-master-professionnel-gestion-financi-re-et-comptabl	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Gestion Financière et Comptable (Master Professionnel)	Dakar	Variable	20000	FCFA	Master Professionnel	\N	Formation en Gestion Financière et Comptable à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgh0031gny4g691qhli	estg-dakar-master-professionnel-management-et-strat-gie-d-entr	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Management et Stratégie d'Entreprise (Master Professionnel)	Dakar	Variable	20000	FCFA	Master Professionnel	\N	Formation en Management et Stratégie d'Entreprise à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgi0035gny4cs9gzah1	estg-dakar-master-professionnel-transport-logistique	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Transport Logistique (Master Professionnel)	Dakar	Variable	20000	FCFA	Master Professionnel	\N	Formation en Transport Logistique à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgl003agny4drswi7i0	hecm-dakar-bts-marketing-et-communication-dig	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Marketing et Communication Digitale (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Marketing et Communication Digitale à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgm003egny4fqhlomq2	hecm-dakar-licence-finance-banque-assurances	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Finance-Banque-Assurances (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Finance-Banque-Assurances à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgn003ggny4gmdv9vid	hecm-dakar-licence-journalisme-et-information	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Journalisme et information (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Journalisme et information à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgo003igny47a0wjn8y	hecm-dakar-licence-marketing-et-communication-dig	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Marketing et Communication Digitale (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing et Communication Digitale à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgo003kgny4mhnr1zpl	hecm-dakar-licence-ressources-humaines	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Ressources Humaines (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Ressources Humaines à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgr003mgny47rgj1q70	hecm-dakar-licence-services-de-transport-logistiq	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Services de Transport/Logistique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Services de Transport/Logistique à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgu003qgny4o3b2c4xj	hecm-dakar-master-gestion-des-ressources-humaine	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Gestion des Ressources Humaines (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Gestion des Ressources Humaines à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgu003sgny40ou7qmod	hecm-dakar-master-marketing-communication-digita	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Marketing-Communication Digitale (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Marketing-Communication Digitale à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgk0038gny438zy5bql	hecm-dakar-bts-comptabilit-et-fiscalit	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Comptabilité et fiscalité (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Comptabilité et fiscalité à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgl003cgny4zm4rdrkj	hecm-dakar-licence-comptabilit-et-fiscalit	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Comptabilité et fiscalité (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Comptabilité et fiscalité à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgs003ogny4uq2a47xl	hecm-dakar-licence-technologies-de-l-information	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Technologies de l'Information et de la Communication (TIC) (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Technologies de l'Information et de la Communication (TIC) à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgv003ugny4bbhbukcn	hecm-dakar-master-finance-banque-assurances	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Finance-Banque-Assurances (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Finance-Banque-Assurances à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgw003wgny4ym1bzurb	hecm-dakar-master-transport-logistique	cmrghucgj0036gny4kxqwskcn	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Transport-Logistique à HECM — Espace HECM – Hautes Études de Coaching et de Management.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgx003zgny46czeewtc	abs-school-dakar-bts-fili-res-homologu-es-par-le-mi	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Filières homologuées par le ministère de la Formation professionnelle (transit-douane, gestion, etc.) (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Filières homologuées par le ministère de la Formation professionnelle (transit-douane, gestion, etc.) à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgy0041gny46fk8cpc4	abs-school-dakar-licence-banque-assurance	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Banque-Assurance (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Banque-Assurance à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgy0043gny41gsdbvn4	abs-school-dakar-licence-marketing-communication	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Marketing-Communication (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing-Communication à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgz0045gny4m8t7p6bl	abs-school-dakar-licence-commerce-international	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Commerce International (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Commerce International à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch10047gny49zzwadgb	abs-school-dakar-licence-droit-et-contentieux-des-affai	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Droit et Contentieux des Affaires (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Droit et Contentieux des Affaires à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch2004bgny46d74r7z9	abs-school-dakar-licence-transport-logistique	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Transport-Logistique à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch3004dgny4hzdthx3b	abs-school-dakar-master-num-rique	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Numérique (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Numérique à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch4004fgny4hbasc9f7	abs-school-dakar-master-finance	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Finance (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Finance à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch4004hgny4nbdawp4j	abs-school-dakar-master-commerce	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Commerce (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Commerce à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch5004jgny4ot5d6ao1	abs-school-dakar-master-entrepreneuriat	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Entrepreneuriat (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Entrepreneuriat à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch6004mgny4e60hkqbi	amdi-afrique-dt-diplomes-sante-d-etat-infirmier-d-tat	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Infirmier d'État (DT/Diplômes santé d'État)	Dakar	Variable	20000	FCFA	DT/Diplômes santé d'État	\N	Formation en Infirmier d'État à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch7004ogny4hlvjb8f2	amdi-afrique-dt-diplomes-sante-d-etat-sage-femme-d-tat	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Sage-femme d'État (DT/Diplômes santé d'État)	Dakar	Variable	20000	FCFA	DT/Diplômes santé d'État	\N	Formation en Sage-femme d'État à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch8004qgny48el3gc8u	amdi-afrique-dt-diplomes-sante-d-etat-vendeur-en-pharmacie	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Vendeur en Pharmacie (DT/Diplômes santé d'État)	Dakar	Variable	20000	FCFA	DT/Diplômes santé d'État	\N	Formation en Vendeur en Pharmacie à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch8004sgny4qw3hr8xq	amdi-afrique-dt-diplomes-sante-d-etat-d-l-gation-m-dicale	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Délégation Médicale (DT/Diplômes santé d'État)	Dakar	Variable	20000	FCFA	DT/Diplômes santé d'État	\N	Formation en Délégation Médicale à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucha004wgny43dkfz9q7	amdi-afrique-licence-agroalimentaire	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Agroalimentaire (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Agroalimentaire à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchb004ygny41gb8474v	amdi-afrique-licence-g-ologie-mines-p-trochimie	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Géologie-Mines-Pétrochimie (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Géologie-Mines-Pétrochimie à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchc0050gny4zso4soqa	amdi-afrique-licence-g-omatique-terre-environnement	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Géomatique-Terre-Environnement (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Géomatique-Terre-Environnement à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchf0056gny4l75enk7z	amdi-afrique-licence-g-nie-civil	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Génie Civil (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Génie Civil à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchg0058gny4t4h1wxqk	amdi-afrique-licence-g-nie-informatique	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Génie Informatique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Génie Informatique à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchh005agny4xei2aafz	amdi-afrique-licence-technologie-des-r-seaux-et-t-l	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Technologie des réseaux et télécommunications (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Technologie des réseaux et télécommunications à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchj005ggny4mgaay33o	amdi-afrique-licence-administration-droit-et-fiscal	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Administration Droit et Fiscalité (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Administration Droit et Fiscalité à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchk005igny4w8q2stn8	amdi-afrique-licence-journalisme-et-communication	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Journalisme et Communication (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Journalisme et Communication à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchl005kgny4cln1nr7y	amdi-afrique-licence-marketing-digital-et-r-seaux-s	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Marketing Digital et Réseaux Sociaux (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing Digital et Réseaux Sociaux à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchm005mgny44k4md2zv	amdi-afrique-licence-transport-logistique	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Transport-Logistique à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchm005ogny40sekfkhu	amdi-afrique-master-catalyse-en-g-nie-p-trochimie	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Catalyse en génie pétrochimie (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Catalyse en génie pétrochimie à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuche0052gny4m1rn1nty	amdi-afrique-licence-g-nie-lectrom-canique	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Génie Électromécanique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Génie Électromécanique à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuche0054gny4jmy9k5wv	amdi-afrique-licence-g-nie-lectrotechnique-lectro	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Génie Électrotechnique-Électronique-Automatique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Génie Électrotechnique-Électronique-Automatique à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchh005cgny4bt20t7uf	amdi-afrique-licence-lectrom-canique	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Électromécanique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Électromécanique à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchi005egny42drmqnbm	amdi-afrique-licence-conomie-et-gestion-quantitati	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Économie et Gestion Quantitatives (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Économie et Gestion Quantitatives à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci2006qgny4zm4otgzo	cefas-senegal-bt-bts-dts-d-partement-sant	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Département Santé (BT/BTS/DTS)	Dakar	Variable	20000	FCFA	BT/BTS/DTS	\N	Formation en Département Santé à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucho005sgny47gsno0w2	amdi-afrique-master-automatisation-en-industries-p	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Automatisation en industries pétrochimiques (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Automatisation en industries pétrochimiques à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchp005ugny4ohler92g	amdi-afrique-master-analyses-biologiques	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Analyses Biologiques (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Analyses Biologiques à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchp005wgny4r9tpw7tt	amdi-afrique-master-banque-priv-e-internationale	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Banque Privée Internationale (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Banque Privée Internationale à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchr0060gny44i68oeim	amdi-afrique-master-logistique-et-transport-intern	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Logistique et Transport International (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Logistique et Transport International à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchs0064gny4g7gsfibc	amdi-afrique-master-grh	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	GRH (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en GRH à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucht0066gny49a4fny01	amdi-afrique-master-management-du-luxe	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Management du Luxe (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Management du Luxe à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchu0068gny40btd8jse	amdi-afrique-master-marketing-digital-et-m-dias-so	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Marketing Digital et Médias Sociaux (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Marketing Digital et Médias Sociaux à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchv006bgny4o4fkrz2d	isbd-dakar-licence-informatique-de-gestion	cmrghuchv0069gny4dqtpl3n1	cmrghoxmf0000gnzbjfp0btij	Informatique de gestion (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Informatique de gestion à ISBD — International School of Business and Development.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchw006dgny40nkax1bd	isbd-dakar-licence-marketing-et-communication	cmrghuchv0069gny4dqtpl3n1	cmrghoxmf0000gnzbjfp0btij	Marketing et Communication (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing et Communication à ISBD — International School of Business and Development.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchw006fgny4kaiuodqt	isbd-dakar-licence-ressources-humaines	cmrghuchv0069gny4dqtpl3n1	cmrghoxmf0000gnzbjfp0btij	Ressources Humaines (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Ressources Humaines à ISBD — International School of Business and Development.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchx006hgny4kzqf3yjq	isbd-dakar-licence-transport-logistique	cmrghuchv0069gny4dqtpl3n1	cmrghoxmf0000gnzbjfp0btij	Transport Logistique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Transport Logistique à ISBD — International School of Business and Development.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchq005ygny4vsiimwih	amdi-afrique-master-conomie-maritime-et-portuaire	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Économie Maritime et Portuaire (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Économie Maritime et Portuaire à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchs0062gny4q51mhc50	amdi-afrique-master-management-de-la-qualit	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Management de la Qualité (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Management de la Qualité à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchy006jgny49k9kuek2	isbd-dakar-master-comptabilit-financi-re-et-ges	cmrghuchv0069gny4dqtpl3n1	cmrghoxmf0000gnzbjfp0btij	Comptabilité financière et gestion budgétaire (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Comptabilité financière et gestion budgétaire à ISBD — International School of Business and Development.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci0006mgny4y3743slj	cefas-senegal-bt-bts-dts-analyse-biologique-sant	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Analyse Biologique (Santé) (BT/BTS/DTS)	Dakar	Variable	20000	FCFA	BT/BTS/DTS	\N	Formation en Analyse Biologique (Santé) à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci0006ogny4rop1zbgc	cefas-senegal-bt-bts-dts-fili-res-techniques-lectrici	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Filières Techniques (électricité, mécanique, génie industriel) (BT/BTS/DTS)	Dakar	Variable	20000	FCFA	BT/BTS/DTS	\N	Formation en Filières Techniques (électricité, mécanique, génie industriel) à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci3006sgny44wvxkwyh	cefas-senegal-licence-banque-finance-assurance	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Banque-Finance-Assurance à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci4006ugny4hjqtkxtv	cefas-senegal-licence-commerce-international	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Commerce International (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Commerce International à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci5006ygny4hzb3afi3	cefas-senegal-licence-gestion-des-entreprises	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Gestion des entreprises (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Gestion des entreprises à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci60070gny4eikhytzm	cefas-senegal-licence-grh	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	GRH (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en GRH à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci80072gny4mu7j5aub	cefas-senegal-licence-marketing-communication	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Marketing-Communication (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing-Communication à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci90074gny4cz29ks46	cefas-senegal-licence-transport-logistique	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Transport-Logistique à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucii0076gny476qpbeln	cefas-senegal-licence-journalisme-et-communication	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Journalisme et Communication (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Journalisme et Communication à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucij0078gny4mjl5cci2	cefas-senegal-licence-g-nie-informatique	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Génie Informatique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Génie Informatique à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucil007agny4e6k6numz	cefas-senegal-licence-informatique-de-gestion	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Informatique de Gestion (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Informatique de Gestion à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucin007cgny4kphtgaci	cefas-senegal-master-gestion-des-entreprises	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Gestion des entreprises (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Gestion des entreprises à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucio007egny4g5mh4rc1	cefas-senegal-master-g-nie-informatique	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Génie Informatique (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Génie Informatique à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucip007ggny40oo0yu86	cefas-senegal-master-informatique-de-gestion	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Informatique de Gestion (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Informatique de Gestion à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucit007pgny4jv788ljt	sup-immo-dakar-licence-professionnelle-gestion-immobili-re	cmrghuciq007hgny4053u1lsg	cmrghoxmf0000gnzbjfp0btij	Gestion immobilière (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Gestion immobilière à SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucir007jgny42wr8fhfw	sup-immo-dakar-certificat-certificat-professionnel-de-l	cmrghuciq007hgny4053u1lsg	cmrghoxmf0000gnzbjfp0btij	Certificat Professionnel de l'Immobilier (CPI, 6 mois) (Certificat)	Dakar	Variable	20000	FCFA	Certificat	\N	Formation en Certificat Professionnel de l'Immobilier (CPI, 6 mois) à SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucir007lgny4gb4uneo8	sup-immo-dakar-diplome-d-ecole-dipl-me-d-agent-immobilier-da	cmrghuciq007hgny4053u1lsg	cmrghoxmf0000gnzbjfp0btij	Diplôme d'Agent Immobilier (DAI, 9 mois) (Diplôme d'école)	Dakar	Variable	20000	FCFA	Diplôme d'école	\N	Formation en Diplôme d'Agent Immobilier (DAI, 9 mois) à SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucis007ngny4l34t9s76	sup-immo-dakar-diplome-d-ecole-dipl-me-professionnel-de-l-imm	cmrghuciq007hgny4053u1lsg	cmrghoxmf0000gnzbjfp0btij	Diplôme Professionnel de l'Immobilier (DPI) (Diplôme d'école)	Dakar	Variable	20000	FCFA	Diplôme d'école	\N	Formation en Diplôme Professionnel de l'Immobilier (DPI) à SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuciu007rgny46mpwutdf	sup-immo-dakar-licence-professionnelle-droit-immobilier-et-foncier	cmrghuciq007hgny4053u1lsg	cmrghoxmf0000gnzbjfp0btij	Droit immobilier et foncier (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Droit immobilier et foncier à SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuciu007tgny47x0fayl6	sup-immo-dakar-licence-professionnelle-b-timent-et-g-nie-civil	cmrghuciq007hgny4053u1lsg	cmrghoxmf0000gnzbjfp0btij	Bâtiment et Génie Civil (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Bâtiment et Génie Civil à SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucj00088gny42w9p7skt	ipd-thomas-sankara-licence-informatique	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Informatique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Informatique à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucj1008agny480qz4r7o	ipd-thomas-sankara-licence-g-nie-logiciel	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Génie Logiciel (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Génie Logiciel à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucj1008cgny4y819nkwp	ipd-thomas-sankara-licence-r-seaux-tic	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Réseaux/TIC (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Réseaux/TIC à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucj3008ggny49sah87dp	ipd-thomas-sankara-licence-ia	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	IA (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en IA à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucj4008igny4wuylaerm	ipd-thomas-sankara-licence-g-nie-civil	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Génie Civil (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Génie Civil à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucji008mgny4way1rtzs	ipd-thomas-sankara-licence-rh	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	RH (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en RH à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucjj008ogny48cnolcra	ipd-thomas-sankara-licence-marketing	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Marketing (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuciw007ygny4o71wypnp	ipd-thomas-sankara-bts-dts-informatique	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Informatique (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Informatique à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucix0080gny48cbg1jw3	ipd-thomas-sankara-bts-dts-r-seaux-tic	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Réseaux/TIC (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Réseaux/TIC à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuciy0082gny4731f6h6a	ipd-thomas-sankara-bts-dts-g-nie-civil	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Génie Civil (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Génie Civil à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuciz0084gny4yjdc2xq9	ipd-thomas-sankara-bts-dts-comptabilit	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Comptabilité (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Comptabilité à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuciz0086gny4w2zfb4j3	ipd-thomas-sankara-bts-dts-transport-logistique	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Transport-Logistique à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucj2008egny4r6huzkme	ipd-thomas-sankara-licence-lectrotechnique	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Électrotechnique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Électrotechnique à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucj7008kgny4o6ymwymf	ipd-thomas-sankara-licence-comptabilit	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Comptabilité (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Comptabilité à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucjk008qgny4k2v56c7a	ipd-thomas-sankara-licence-finance	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Finance (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Finance à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucju008sgny4r9pvra4h	ipd-thomas-sankara-licence-qhse	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	QHSE (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en QHSE à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucjw008wgny4ldjiwzzy	ipd-thomas-sankara-licence-gestion-de-projet	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Gestion de projet (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Gestion de projet à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucjx008ygny48zsg3s9l	ipd-thomas-sankara-licence-audit	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Audit (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Audit à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucjy0090gny49yml29ps	ipd-thomas-sankara-licence-transport	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Transport (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Transport à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucjz0092gny46g0nowtb	ipd-thomas-sankara-licence-transit	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Transit (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Transit à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucjv008ugny4szgihhza	ipd-thomas-sankara-licence-commerce-international	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Commerce International (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Commerce International à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckd009ngny4bwpq7wd0	esup-dakar-licence-communication-d-entreprise	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Communication d'entreprise (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Communication d'entreprise à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuck10096gny49kv9f40p	ipd-thomas-sankara-master-m-mes-fili-res-que-la-licence	cmrghuciw007wgny4ybtbw7ur	cmrghoxmf0000gnzbjfp0btij	Mêmes filières que la Licence, poursuivies en 2ᵉ cycle (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Mêmes filières que la Licence, poursuivies en 2ᵉ cycle à IPD Thomas Sankara — Institut Polytechnique de Dakar « Thomas Sankara ».	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuck30099gny4ma0hvz9r	esup-dakar-bts-dts-administration-et-gestion-des	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Administration et Gestion des Entreprises (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Administration et Gestion des Entreprises à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuck4009bgny46lp9g8sg	esup-dakar-bts-dts-informatique	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Informatique (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Informatique à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuck5009dgny4llecamxu	esup-dakar-bts-dts-t-l-communications	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Télécommunications (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Télécommunications à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuck6009fgny4hoodaa0j	esup-dakar-bts-dts-r-seaux-et-s-curit-informatiq	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Réseaux et Sécurité informatique (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Réseaux et Sécurité informatique à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuck9009hgny4v8ehr3it	esup-dakar-bts-dts-g-nie-lectrique	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Génie Électrique (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Génie Électrique à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucka009jgny49gvz5idn	esup-dakar-bts-dts-g-nie-industriel	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Génie Industriel (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Génie Industriel à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckc009lgny4a5eu8q3u	esup-dakar-licence-administration-et-gestion-des	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Administration et Gestion des Entreprises (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Administration et Gestion des Entreprises à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckd009pgny4kijh0ac8	esup-dakar-licence-transport-logistique	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Transport-Logistique à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckf009rgny47vfrj223	esup-dakar-licence-banque-assurance-finance	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Banque-Assurance-Finance (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Banque-Assurance-Finance à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckt00aigny4tentavos	ifaa-dakar-master-management	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Management (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Management à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucku00akgny4ejj0x4qt	ifaa-dakar-master-rh	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	RH (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en RH à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckv00amgny47l9m6s76	ifaa-dakar-master-finance	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Finance (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Finance à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckj009wgny4kql28w6g	ifaa-dakar-bts-dts-banque-finance-assurance	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Banque-Finance-Assurance à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckk009ygny4qtunfagh	ifaa-dakar-bts-dts-comptabilit-gestion	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Comptabilité-Gestion à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckl00a0gny4abujxxal	ifaa-dakar-bts-dts-marketing	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Marketing (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Marketing à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckm00a2gny4id5wi3a2	ifaa-dakar-bts-dts-commerce-international	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Commerce International (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Commerce International à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckm00a4gny4seuhjyqm	ifaa-dakar-bts-dts-transport-logistique	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (BTS/DTS)	Dakar	Variable	20000	FCFA	BTS/DTS	\N	Formation en Transport-Logistique à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckn00a6gny4invc7giy	ifaa-dakar-bachelor-licence-ressources-humaines	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Ressources Humaines (Bachelor/Licence)	Dakar	Variable	20000	FCFA	Bachelor/Licence	\N	Formation en Ressources Humaines à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucko00a8gny4gml5ccbl	ifaa-dakar-bachelor-licence-management	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Management (Bachelor/Licence)	Dakar	Variable	20000	FCFA	Bachelor/Licence	\N	Formation en Management à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckp00aagny4axcqvf59	ifaa-dakar-bachelor-licence-agroalimentaire	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Agroalimentaire (Bachelor/Licence)	Dakar	Variable	20000	FCFA	Bachelor/Licence	\N	Formation en Agroalimentaire à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckq00acgny42gxow6jg	ifaa-dakar-bachelor-licence-informatique-de-gestion	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Informatique de Gestion (Bachelor/Licence)	Dakar	Variable	20000	FCFA	Bachelor/Licence	\N	Formation en Informatique de Gestion à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckr00aegny4hrg75bc1	ifaa-dakar-bachelor-licence-comptabilit-gestion	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (Bachelor/Licence)	Dakar	Variable	20000	FCFA	Bachelor/Licence	\N	Formation en Comptabilité-Gestion à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucks00aggny46kfpqqli	ifaa-dakar-bachelor-licence-banque-finance-assurance	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (Bachelor/Licence)	Dakar	Variable	20000	FCFA	Bachelor/Licence	\N	Formation en Banque-Finance-Assurance à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucl100atgny41h0zgyxo	ensup-afrique-dakar-bts-grh	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	GRH (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en GRH à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucl600avgny4dp3ed3ak	ensup-afrique-dakar-bts-marketing	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Marketing (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Marketing à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucl700axgny424w5a5xa	ensup-afrique-dakar-bts-transport-logistique	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Transport-Logistique à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclc00b1gny47v97us6k	ensup-afrique-dakar-licence-communication-journalisme	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Communication-Journalisme (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Communication-Journalisme à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucld00b3gny4ynk6c363	ensup-afrique-dakar-licence-grh	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	GRH (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en GRH à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclg00b7gny4hh5o79lo	ensup-afrique-dakar-licence-banque-finance-assurance	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Banque-Finance-Assurance à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclj00b9gny4qugalac8	ensup-afrique-dakar-licence-administration-des-biens-et-ge	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Administration des biens et Gestion immobilière (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Administration des biens et Gestion immobilière à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclk00bbgny4n05b87y5	ensup-afrique-dakar-licence-marketing	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Marketing (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Marketing à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucln00bhgny46yppcnp3	ensup-afrique-dakar-master-communication-journalisme	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Communication-Journalisme (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Communication-Journalisme à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucky00argny40tdupmt7	ensup-afrique-dakar-bts-comptabilit-gestion	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Comptabilité-Gestion à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucl900azgny4axfu1bqw	ensup-afrique-dakar-licence-comptabilit-gestion	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Comptabilité-Gestion à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucle00b5gny4teaanor2	ensup-afrique-dakar-licence-gestion-du-transport-et-de-la	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Gestion du Transport et de la Logistique (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Gestion du Transport et de la Logistique à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucll00bdgny4odaoe446	ensup-afrique-dakar-licence-gestion-administrative-et-des	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Gestion administrative et des collectivités (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Gestion administrative et des collectivités à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclm00bfgny4amdiqr0x	ensup-afrique-dakar-master-comptabilit-gestion	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Comptabilité-Gestion à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclo00bjgny49z21w3lr	ensup-afrique-dakar-master-passation-des-march-s-publics	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Passation des marchés publics GRH (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Passation des marchés publics GRH à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclp00blgny4ln0p2yh0	ensup-afrique-dakar-master-transport-logistique	cmrghuckx00apgny4l4214v0c	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Transport-Logistique à ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclt00bugny4uf8bwtym	elite-sante-licence-licence-en-sciences-infirmi-re	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Licence en Sciences infirmières (Licence)	Keur Massar	3 ans	20000	FCFA	Licence	\N	Formation en Licence en Sciences infirmières à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclu00bwgny4nrjouhuq	elite-sante-licence-licence-en-sciences-obst-trica	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Licence en Sciences obstétricales (Licence)	Keur Massar	3 ans	20000	FCFA	Licence	\N	Formation en Licence en Sciences obstétricales à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclu00bygny4glk2i3mu	elite-sante-licence-licence-en-biologie-m-dicale	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Licence en Biologie Médicale (Licence)	Keur Massar	3 ans	20000	FCFA	Licence	\N	Formation en Licence en Biologie Médicale à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucm400cdgny4mu7wxdvi	img-rufisque-licence-professionnelle-fili-res-de-gestion-et-managem	cmrghuclx00c3gny4w508cjpo	cmrghoxmf0000gnzbjfp0btij	Filières de gestion et management (Licence Professionnelle)	Rufisque	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Filières de gestion et management à IMG (Rufisque) — Institut de Management et de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucma00cggny47a4347cg	afpa-dakar-bts-h-tellerie-restauration	cmrghucm600cegny4851cg44l	cmrghoxmf0000gnzbjfp0btij	Hôtellerie-Restauration (BTS)	Colobane	2 ans	20000	FCFA	BTS	\N	Formation en Hôtellerie-Restauration à AFPA — Africaine des Formations Professionnelles en Alternance.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmb00cigny4sq5kvtuj	afpa-dakar-bts-tourisme	cmrghucm600cegny4851cg44l	cmrghoxmf0000gnzbjfp0btij	Tourisme (BTS)	Colobane	2 ans	20000	FCFA	BTS	\N	Formation en Tourisme à AFPA — Africaine des Formations Professionnelles en Alternance.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclr00bqgny48isxi642	elite-sante-diplomes-d-etat-infirmier-d-tat	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Infirmier d'État (Diplômes d'État)	Keur Massar	Variable	20000	FCFA	Diplômes d'État	\N	Formation en Infirmier d'État à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucls00bsgny4jndjl8ck	elite-sante-diplomes-d-etat-assistant-infirmier	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Assistant infirmier (Diplômes d'État)	Keur Massar	Variable	20000	FCFA	Diplômes d'État	\N	Formation en Assistant infirmier à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclv00c0gny46574biwn	elite-sante-specialisations-infirmier-de-bloc-op-ratoire	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Infirmier de bloc opératoire (Spécialisations)	Keur Massar	Variable	20000	FCFA	Spécialisations	\N	Formation en Infirmier de bloc opératoire à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclx00c2gny4y4hb0u73	elite-sante-specialisations-d-l-gu-m-dical	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Délégué médical (Spécialisations)	Keur Massar	Variable	20000	FCFA	Spécialisations	\N	Formation en Délégué médical à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucly00c5gny43sf2v8za	img-rufisque-dts-bep-dep-comptabilit-de-gestion	cmrghuclx00c3gny4w508cjpo	cmrghoxmf0000gnzbjfp0btij	Comptabilité de gestion (DTS/BEP/DEP)	Rufisque	Variable	20000	FCFA	DTS/BEP/DEP	\N	Formation en Comptabilité de gestion à IMG (Rufisque) — Institut de Management et de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucm100c7gny4yotjc1yj	img-rufisque-dts-bep-dep-transport-logistique	cmrghuclx00c3gny4w508cjpo	cmrghoxmf0000gnzbjfp0btij	Transport logistique (DTS/BEP/DEP)	Rufisque	Variable	20000	FCFA	DTS/BEP/DEP	\N	Formation en Transport logistique à IMG (Rufisque) — Institut de Management et de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucm200c9gny4d33byra7	img-rufisque-dts-bep-dep-marketing-et-communication	cmrghuclx00c3gny4w508cjpo	cmrghoxmf0000gnzbjfp0btij	Marketing et communication (DTS/BEP/DEP)	Rufisque	Variable	20000	FCFA	DTS/BEP/DEP	\N	Formation en Marketing et communication à IMG (Rufisque) — Institut de Management et de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucm300cbgny4cln04hso	img-rufisque-dts-bep-dep-journalisme-et-communication	cmrghuclx00c3gny4w508cjpo	cmrghoxmf0000gnzbjfp0btij	Journalisme et Communication (DTS/BEP/DEP)	Rufisque	Variable	20000	FCFA	DTS/BEP/DEP	\N	Formation en Journalisme et Communication à IMG (Rufisque) — Institut de Management et de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmb00ckgny4urcbkbbf	afpa-dakar-bts-sant	cmrghucm600cegny4851cg44l	cmrghoxmf0000gnzbjfp0btij	Santé (BTS)	Colobane	2 ans	20000	FCFA	BTS	\N	Formation en Santé à AFPA — Africaine des Formations Professionnelles en Alternance.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmd00cmgny42cpw5omr	afpa-dakar-bts-gestion-h-teli-re	cmrghucm600cegny4851cg44l	cmrghoxmf0000gnzbjfp0btij	Gestion Hôtelière (BTS)	Colobane	2 ans	20000	FCFA	BTS	\N	Formation en Gestion Hôtelière à AFPA — Africaine des Formations Professionnelles en Alternance.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmg00crgny4ro6iez40	isca-dakar-dt-du-dts-bts-bt-dut-certificat-deug-informatique-de-gestion	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Informatique de Gestion (DT/DU/DTS/BTS/BT/DUT/Certificat/DEUG)	Dakar	Variable	20000	FCFA	DT/DU/DTS/BTS/BT/DUT/Certificat/DEUG	\N	Formation en Informatique de Gestion à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmg00ctgny40vu5f5ao	isca-dakar-dt-du-dts-bts-bt-dut-certificat-deug-r-seaux-informatique	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Réseaux Informatique (DT/DU/DTS/BTS/BT/DUT/Certificat/DEUG)	Dakar	Variable	20000	FCFA	DT/DU/DTS/BTS/BT/DUT/Certificat/DEUG	\N	Formation en Réseaux Informatique à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmh00cvgny4nic2lbh9	isca-dakar-bachelor-licence-licence-professionnelle-informatique-de-gestion	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Informatique de Gestion (Bachelor/Licence/Licence Professionnelle)	Dakar	Variable	20000	FCFA	Bachelor/Licence/Licence Professionnelle	\N	Formation en Informatique de Gestion à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmi00cxgny4rdp0hyjb	isca-dakar-bachelor-licence-licence-professionnelle-gestion-conomique-et-financi	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Gestion Économique et Financière des Entreprises (Bachelor/Licence/Licence Professionnelle)	Dakar	Variable	20000	FCFA	Bachelor/Licence/Licence Professionnelle	\N	Formation en Gestion Économique et Financière des Entreprises à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmj00czgny4fophfw33	isca-dakar-bachelor-licence-licence-professionnelle-maintenance-r-seaux-informatiq	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Maintenance-Réseaux Informatique et Télécommunications (Bachelor/Licence/Licence Professionnelle)	Dakar	Variable	20000	FCFA	Bachelor/Licence/Licence Professionnelle	\N	Formation en Maintenance-Réseaux Informatique et Télécommunications à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmj00d1gny40ruq6c6e	isca-dakar-bachelor-licence-licence-professionnelle-multim-dia-num-rique	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Multimédia Numérique (Bachelor/Licence/Licence Professionnelle)	Dakar	Variable	20000	FCFA	Bachelor/Licence/Licence Professionnelle	\N	Formation en Multimédia Numérique à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmk00d3gny4if6n5snm	isca-dakar-master-master-professionnel-master-recherche-mba-maintenance-r-seaux-informatiq	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Maintenance-Réseaux Informatiques et Télécoms (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Maintenance-Réseaux Informatiques et Télécoms à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucml00d5gny468b8hlsk	isca-dakar-master-master-professionnel-master-recherche-mba-marketing-communication-et-act	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Marketing-Communication et Action Commerciale (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Marketing-Communication et Action Commerciale à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmm00d7gny4wr8d3r7z	isca-dakar-master-master-professionnel-master-recherche-mba-gestion-publique	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Gestion Publique (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Gestion Publique à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmn00d9gny4hpnwjqdn	isca-dakar-master-master-professionnel-master-recherche-mba-gestion-de-projets	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Gestion de Projets (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Gestion de Projets à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmo00dbgny4rdkct2qm	isca-dakar-master-master-professionnel-master-recherche-mba-ing-nierie-financi-re	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Ingénierie Financière (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Ingénierie Financière à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmw00dmgny44lwtoa6d	ipg-isti-dakar-bts-informatique	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Informatique (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Informatique à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmy00dogny4koyac3in	ipg-isti-dakar-bts-froid-climatisation	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Froid-Climatisation (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Froid-Climatisation à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn200dugny4xi7njn5d	ipg-isti-dakar-licence-gestion	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Gestion (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Gestion à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn300dwgny42tzl9zjz	ipg-isti-dakar-licence-finance	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Finance (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Finance à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn400dygny4e2rxromu	ipg-isti-dakar-licence-affaires	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Affaires (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Affaires à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn500e0gny4okxupzj6	ipg-isti-dakar-licence-ing-nierie	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Ingénierie (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Ingénierie à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn700e4gny4d46su24u	ipg-isti-dakar-master-gestion-et-affaires	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Gestion et Affaires (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Gestion et Affaires à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmr00dfgny4hac51spv	isca-dakar-master-master-professionnel-master-recherche-mba-communication	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Communication (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Communication à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucms00dhgny4nfz9ytls	isca-dakar-master-master-professionnel-master-recherche-mba-gestion-des-ressources-humaine	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Gestion des Ressources Humaines (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Gestion des Ressources Humaines à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmv00dkgny4k7bf3y1f	ipg-isti-dakar-bts-lectronique	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Électronique (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Électronique à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmz00dqgny4g809dl29	ipg-isti-dakar-bts-lectrotechnique	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Électrotechnique (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Électrotechnique à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn000dsgny4q5vadbqg	ipg-isti-dakar-bts-lectrom-canique	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Électromécanique (BTS)	Dakar	2 ans	20000	FCFA	BTS	\N	Formation en Électromécanique à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn600e2gny4wreqenqw	ipg-isti-dakar-master-ing-nierie-lectrotechnique	cmrghucmu00digny4yb5pc1ch	cmrghoxmf0000gnzbjfp0btij	Ingénierie (électrotechnique/électromécanique/froid-climatisation) (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Ingénierie (électrotechnique/électromécanique/froid-climatisation) à IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn800e7gny4a9fijnn8	smi-thies-bt-bts-dec-comptabilit	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Comptabilité (BT/BTS/DEC)	Thiès	Variable	20000	FCFA	BT/BTS/DEC	\N	Formation en Comptabilité à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucn900e9gny4eojx8rqu	smi-thies-bt-bts-dec-gestion	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Gestion (BT/BTS/DEC)	Thiès	Variable	20000	FCFA	BT/BTS/DEC	\N	Formation en Gestion à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnj00engny4kfqv86ep	smi-thies-licence-commerce-international	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Commerce International (Licence)	Thiès	3 ans	20000	FCFA	Licence	\N	Formation en Commerce International à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnk00epgny42qmnor3l	smi-thies-licence-informatique-de-gestion	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Informatique de Gestion (Licence)	Thiès	3 ans	20000	FCFA	Licence	\N	Formation en Informatique de Gestion à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnl00ergny4cdhsryry	smi-thies-licence-administration-r-seaux	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Administration Réseaux (Licence)	Thiès	3 ans	20000	FCFA	Licence	\N	Formation en Administration Réseaux à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnm00etgny4slt8at55	smi-thies-licence-assistanat	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Assistanat (Licence)	Thiès	3 ans	20000	FCFA	Licence	\N	Formation en Assistanat à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnm00evgny46mwpovov	smi-thies-licence-banque-assurance	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Banque-Assurance (Licence)	Thiès	3 ans	20000	FCFA	Licence	\N	Formation en Banque-Assurance à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucob00f1gny43jfqva11	smi-thies-master-gestion	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Gestion (Master)	Thiès	2 ans	20000	FCFA	Master	\N	Formation en Gestion à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucod00f3gny4fr4927v2	smi-thies-master-management	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Management (Master)	Thiès	2 ans	20000	FCFA	Master	\N	Formation en Management à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnc00edgny40ms1yixw	smi-thies-bt-bts-dec-commerce	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Commerce (BT/BTS/DEC)	Thiès	Variable	20000	FCFA	BT/BTS/DEC	\N	Formation en Commerce à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnd00efgny4f8tu0tt0	smi-thies-bt-bts-dec-logistique	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Logistique (BT/BTS/DEC)	Thiès	Variable	20000	FCFA	BT/BTS/DEC	\N	Formation en Logistique à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucne00ehgny4ngtr7cxm	smi-thies-bt-bts-dec-marketing	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Marketing (BT/BTS/DEC)	Thiès	Variable	20000	FCFA	BT/BTS/DEC	\N	Formation en Marketing à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucni00ejgny4s4ma5dpp	smi-thies-bt-bts-dec-informatique	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Informatique (BT/BTS/DEC)	Thiès	Variable	20000	FCFA	BT/BTS/DEC	\N	Formation en Informatique à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucni00elgny4sizab3so	smi-thies-licence-finance-comptabilit	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Finance-Comptabilité (Licence)	Thiès	3 ans	20000	FCFA	Licence	\N	Formation en Finance-Comptabilité à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnn00exgny4paichk29	smi-thies-licence-ing-nierie-des-syst-mes-r-se	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Ingénierie des Systèmes & Réseaux (Licence)	Thiès	3 ans	20000	FCFA	Licence	\N	Formation en Ingénierie des Systèmes & Réseaux à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoa00ezgny4rpltdqui	smi-thies-master-comptabilit	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Comptabilité (Master)	Thiès	2 ans	20000	FCFA	Master	\N	Formation en Comptabilité à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucog00f6gny4b4ovdyub	essem-sante-mbour-diplomes-certifications-secr-tariat-m-dical	cmrghucog00f4gny4qa02nt7y	cmrghoxmf0000gnzbjfp0btij	Secrétariat médical (Diplômes/certifications)	Mbour	Variable	20000	FCFA	Diplômes/certifications	\N	Formation en Secrétariat médical à Essem / ESEM Santé (Mbour) — Institut de formation santé.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoh00f8gny4ein4bcst	essem-sante-mbour-diplomes-certifications-assistant-infirmier	cmrghucog00f4gny4qa02nt7y	cmrghoxmf0000gnzbjfp0btij	Assistant Infirmier (Diplômes/certifications)	Mbour	Variable	20000	FCFA	Diplômes/certifications	\N	Formation en Assistant Infirmier à Essem / ESEM Santé (Mbour) — Institut de formation santé.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoi00fagny41sv0se6a	essem-sante-mbour-diplomes-certifications-gestionnaire-de-pharmacie	cmrghucog00f4gny4qa02nt7y	cmrghoxmf0000gnzbjfp0btij	Gestionnaire de pharmacie (Diplômes/certifications)	Mbour	Variable	20000	FCFA	Diplômes/certifications	\N	Formation en Gestionnaire de pharmacie à Essem / ESEM Santé (Mbour) — Institut de formation santé.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucon00flgny444yoeakf	img-mbour-dts-transport-logistique	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Transport logistique (DTS)	Mbour	2 ans	20000	FCFA	DTS	\N	Formation en Transport logistique à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoo00fngny4zh4wj978	img-mbour-dts-marketing-et-communication	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Marketing et communication (DTS)	Mbour	2 ans	20000	FCFA	DTS	\N	Formation en Marketing et communication à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucop00frgny43khnxk5r	img-mbour-bep-transport-logistique	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Transport logistique (BEP)	Mbour	Variable	20000	FCFA	BEP	\N	Formation en Transport logistique à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoq00ftgny4b5qh4szu	img-mbour-bep-marketing-et-communication	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Marketing et communication (BEP)	Mbour	Variable	20000	FCFA	BEP	\N	Formation en Marketing et communication à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucor00fxgny4f55nhbxw	img-mbour-dep-transport-logistique	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Transport logistique (DEP)	Mbour	Variable	20000	FCFA	DEP	\N	Formation en Transport logistique à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucot00fzgny4szze9cdf	img-mbour-dep-marketing-et-communication	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Marketing et communication (DEP)	Mbour	Variable	20000	FCFA	DEP	\N	Formation en Marketing et communication à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoj00fegny4qropcdwh	essem-sante-mbour-diplomes-certifications-orthoproth-siste	cmrghucog00f4gny4qa02nt7y	cmrghoxmf0000gnzbjfp0btij	Orthoprothésiste (Diplômes/certifications)	Mbour	Variable	20000	FCFA	Diplômes/certifications	\N	Formation en Orthoprothésiste à Essem / ESEM Santé (Mbour) — Institut de formation santé.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucol00fggny48n3iyuoq	essem-sante-mbour-licence-sciences-infirmi-res-param-d	cmrghucog00f4gny4qa02nt7y	cmrghoxmf0000gnzbjfp0btij	Sciences infirmières / paramédicales (Licence)	Mbour	3 ans	20000	FCFA	Licence	\N	Formation en Sciences infirmières / paramédicales à Essem / ESEM Santé (Mbour) — Institut de formation santé.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucom00fjgny4nwdwcc4t	img-mbour-dts-comptabilit-de-gestion	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Comptabilité de gestion (DTS)	Mbour	2 ans	20000	FCFA	DTS	\N	Formation en Comptabilité de gestion à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoo00fpgny4oh34swi1	img-mbour-bep-comptabilit-de-gestion	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Comptabilité de gestion (BEP)	Mbour	Variable	20000	FCFA	BEP	\N	Formation en Comptabilité de gestion à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoq00fvgny4ci10p27u	img-mbour-dep-comptabilit-de-gestion	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Comptabilité de gestion (DEP)	Mbour	Variable	20000	FCFA	DEP	\N	Formation en Comptabilité de gestion à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucou00g1gny4eyezll43	img-mbour-complementaires-journalisme-et-communication	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Journalisme et Communication (Complémentaires)	Mbour	Variable	20000	FCFA	Complémentaires	\N	Formation en Journalisme et Communication à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucov00g3gny4bi2niv1x	img-mbour-complementaires-sant	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Santé (Complémentaires)	Mbour	Variable	20000	FCFA	Complémentaires	\N	Formation en Santé à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucow00g5gny4tuk3xh68	img-mbour-complementaires-restauration	cmrghucol00fhgny4zuos2xh6	cmrghoxmf0000gnzbjfp0btij	Restauration (Complémentaires)	Mbour	Variable	20000	FCFA	Complémentaires	\N	Formation en Restauration à IM / IMG (Mbour) — Institut de Management et de Gestion — Campus Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucox00g8gny49r4gcc14	ensup-afrique-mbour-bts-licence-master-comptabilit-gestion	cmrghucow00g6gny4sjohkr7n	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (BTS/Licence/Master)	Mbour	Variable	20000	FCFA	BTS/Licence/Master	\N	Formation en Comptabilité-Gestion à ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoy00gagny4q4cepx8o	ensup-afrique-mbour-bts-licence-master-grh	cmrghucow00g6gny4sjohkr7n	cmrghoxmf0000gnzbjfp0btij	GRH (BTS/Licence/Master)	Mbour	Variable	20000	FCFA	BTS/Licence/Master	\N	Formation en GRH à ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuce30003gny4p3zb40u4	imtech-nelson-mandela-bts-dt-management	cmrghuce00001gny4nx5v3dvb	cmrghoxmf0000gnzbjfp0btij	Management (BTS/DT)	Dakar	Variable	20000	FCFA	BTS/DT	\N	Formation en Management à IMTECH — Institut de Management et de Technologie Nelson Mandela.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucfn0012gny4x14hlge2	isdb-dakar-dt-dts-bep-bts-comptabilit-gestion-de-caisse	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Comptabilité gestion de caisse (DT/DTS/BEP/BTS)	Dakar	Variable	20000	FCFA	DT/DTS/BEP/BTS	\N	Formation en Comptabilité gestion de caisse à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucg10020gny4gdkpsti9	isdb-dakar-master-comptabilit-contr-le-audit	cmrghucfk000wgny42j1f4mfk	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Contrôle-Audit (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Comptabilité-Contrôle-Audit à ISDB — Institut Supérieur Dakar Banlieue.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucgi0033gny4yfml8dkx	estg-dakar-master-professionnel-qualit-hygi-ne-s-curit-envir	cmrghucg20023gny4vvjzdzva	cmrghoxmf0000gnzbjfp0btij	Qualité Hygiène Sécurité Environnement (QHSE) (Master Professionnel)	Dakar	Variable	20000	FCFA	Master Professionnel	\N	Formation en Qualité Hygiène Sécurité Environnement (QHSE) à ESTG — École Supérieure des Techniques de Gestion.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch20049gny4lpxssil7	abs-school-dakar-licence-comptabilit-gestion	cmrghucgx003xgny493y1lt7l	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Comptabilité-Gestion à ABS School — African Business School.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuch9004ugny4019ag5pb	amdi-afrique-dt-diplomes-sante-d-etat-secr-taire-m-dicale	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Secrétaire médicale (DT/Diplômes santé d'État)	Dakar	Variable	20000	FCFA	DT/Diplômes santé d'État	\N	Formation en Secrétaire médicale à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuchn005qgny4j9k8cz4d	amdi-afrique-master-p-trochimie-et-proc-d-s-polym	cmrghuch6004kgny4f7a46uua	cmrghoxmf0000gnzbjfp0btij	Pétrochimie et procédés polymères (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Pétrochimie et procédés polymères à AMDI — African Millennium Development Institute (AMDI Afrique).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuci4006wgny4rak2batb	cefas-senegal-licence-comptabilit-gestion	cmrghuchz006kgny4zj46lbbn	cmrghoxmf0000gnzbjfp0btij	Comptabilité-Gestion (Licence)	Dakar	3 ans	20000	FCFA	Licence	\N	Formation en Comptabilité-Gestion à CEFAS — Centre de Formation Africain du Sénégal.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuciv007vgny4knu71w5u	sup-immo-dakar-licence-professionnelle-fiscalit-immobili-re	cmrghuciq007hgny4053u1lsg	cmrghoxmf0000gnzbjfp0btij	Fiscalité immobilière (Licence Professionnelle)	Dakar	Variable	20000	FCFA	Licence Professionnelle	\N	Formation en Fiscalité immobilière à SUP'IMMO — Sup'Immo Dakar – École Supérieure de l'Immobilier.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckg009tgny48q1wny5h	esup-dakar-sante-formations-aux-m-tiers-param-d	cmrghuck20097gny4cl3dq6cb	cmrghoxmf0000gnzbjfp0btij	Formations aux métiers paramédicaux (Santé)	Dakar	Variable	20000	FCFA	Santé	\N	Formation en Formations aux métiers paramédicaux à ESUP Dakar — Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuckw00aogny4tcpj5ja3	ifaa-dakar-master-masters-sp-cialis-s-sant	cmrghucki009ugny4ntnmakol	cmrghoxmf0000gnzbjfp0btij	Masters spécialisés santé (Master)	Dakar	2 ans	20000	FCFA	Master	\N	Formation en Masters spécialisés santé à IFAA — Institut de Formation en Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoz00gegny4eb9sb5xh	ensup-afrique-mbour-bts-licence-master-banque-finance-assurance	cmrghucow00g6gny4sjohkr7n	cmrghoxmf0000gnzbjfp0btij	Banque-Finance-Assurance (BTS/Licence/Master)	Mbour	Variable	20000	FCFA	BTS/Licence/Master	\N	Formation en Banque-Finance-Assurance à ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucp000gggny4txyum8nx	ensup-afrique-mbour-bts-licence-master-marketing	cmrghucow00g6gny4sjohkr7n	cmrghoxmf0000gnzbjfp0btij	Marketing (BTS/Licence/Master)	Mbour	Variable	20000	FCFA	BTS/Licence/Master	\N	Formation en Marketing à ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucp000gigny4tu5binrv	ensup-afrique-mbour-bts-licence-master-gestion-immobili-re	cmrghucow00g6gny4sjohkr7n	cmrghoxmf0000gnzbjfp0btij	Gestion immobilière (BTS/Licence/Master)	Mbour	Variable	20000	FCFA	BTS/Licence/Master	\N	Formation en Gestion immobilière à ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucp100gkgny4cyrt5avv	ensup-afrique-mbour-bts-licence-master-march-s-publics	cmrghucow00g6gny4sjohkr7n	cmrghoxmf0000gnzbjfp0btij	Marchés publics (BTS/Licence/Master)	Mbour	Variable	20000	FCFA	BTS/Licence/Master	\N	Formation en Marchés publics à ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghuclr00bogny4da8p7zwp	elite-sante-diplomes-d-etat-sage-femme-d-tat	cmrghuclq00bmgny4c838ysv4	cmrghoxmf0000gnzbjfp0btij	Sage-femme d'État (Diplômes d'État)	Keur Massar	Variable	20000	FCFA	Diplômes d'État	\N	Formation en Sage-femme d'État à Élite Santé — Institut Élite Santé (IES).	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucme00cogny4v1v8awkl	afpa-dakar-diplome-de-qualification-professionnelle-formations-courtes-en-alternan	cmrghucm600cegny4851cg44l	cmrghoxmf0000gnzbjfp0btij	Formations courtes en alternance (agro-business, bâtiment, industrie, hôtellerie de luxe) (Diplôme de qualification professionnelle)	Colobane	Variable	20000	FCFA	Diplôme de qualification professionnelle	\N	Formation en Formations courtes en alternance (agro-business, bâtiment, industrie, hôtellerie de luxe) à AFPA — Africaine des Formations Professionnelles en Alternance.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucmp00ddgny4peglfub8	isca-dakar-master-master-professionnel-master-recherche-mba-banque-assurance-assurance	cmrghucmf00cpgny4ley54whc	cmrghoxmf0000gnzbjfp0btij	Banque-Assurance-Assurance (Master/Master Professionnel/Master Recherche/MBA)	Dakar	Variable	20000	FCFA	Master/Master Professionnel/Master Recherche/MBA	\N	Formation en Banque-Assurance-Assurance à ISCA — Institut Supérieur de Commerce et d'Administration des Affaires.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucnb00ebgny449k0sonr	smi-thies-bt-bts-dec-management	cmrghucn800e5gny43qgrus3k	cmrghoxmf0000gnzbjfp0btij	Management (BT/BTS/DEC)	Thiès	Variable	20000	FCFA	BT/BTS/DEC	\N	Formation en Management à SMI — Sup'Management Intelligentsia.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoi00fcgny4fi86xmw0	essem-sante-mbour-diplomes-certifications-d-l-gu-m-dical	cmrghucog00f4gny4qa02nt7y	cmrghoxmf0000gnzbjfp0btij	Délégué Médical (Diplômes/certifications)	Mbour	Variable	20000	FCFA	Diplômes/certifications	\N	Formation en Délégué Médical à Essem / ESEM Santé (Mbour) — Institut de formation santé.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
cmrghucoy00gcgny4gaojvrmg	ensup-afrique-mbour-bts-licence-master-transport-logistique	cmrghucow00g6gny4sjohkr7n	cmrghoxmf0000gnzbjfp0btij	Transport-Logistique (BTS/Licence/Master)	Mbour	Variable	20000	FCFA	BTS/Licence/Master	\N	Formation en Transport-Logistique à ENSUP Afrique (Mbour) — ENSUP Afrique — antenne Mbour.	Selon les exigences de la filière. Contactez l'établissement pour plus d'informations.	\N	Débouchés selon la filière choisie.	30000
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."Session" (id, token, "userId", "createdAt", "expiresAt") FROM stdin;
cmrmp75810019jla9m9n70l0l	5da2c63a1be45c21a4dbf620a1cb3e1861a438deb1cf5e2df8a1e708a766577ffa48b73fb52842ad4cb30ef6b1267947	cmrmp74xy0015jla9ykxtcfgy	2026-07-15 23:15:12.818	2026-07-29 23:15:12.817
\.


--
-- Data for Name: SiteContent; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."SiteContent" (key, payload, "updatedAt") FROM stdin;
visual_assets	{"stepDoc": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80", "heroHome": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80", "stepApply": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80", "stepExplore": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80", "heroMetiersHub": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80", "heroOrientation": "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1400&q=80", "orientationDocs": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80", "whyChooseBanner": "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1600&q=80", "comparisonSection": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"}	2026-07-11 15:02:42.088
home_hero	{"title": "Trouvez une bourse d'étude pour financer votre formation au Sénégal | BourseFi", "ctaHref": "/bourses", "ctaLabel": "Trouver une bourse", "subtitle": "Comparez les écoles partenaires, découvrez les formations disponibles et obtenez votre attestation de bourse en quelques minutes.", "sectorOptions": ["Tous les secteurs", "Business & Finance", "Technologie & IA", "Sante & Sciences"], "bannerImageUrl": "", "headlineAccent": "pour financer votre formation au Sénégal.", "headlinePrimary": "Trouvez une bourse d'étude", "ctaSecondaryHref": "/bourses", "ctaSecondaryLabel": "Voir les bourses", "searchPlaceholder": "Rechercher une bourse, une école…"}	2026-07-11 15:02:42.089
home_stats	{"items": [{"label": "Bourses disponibles", "value": "245"}, {"label": "Écoles partenaires", "value": "37"}, {"label": "Partenaires financeurs", "value": "8"}, {"label": "Candidatures validées", "value": "1200"}]}	2026-07-11 15:02:42.09
home_process	{"cards": [{"body": "Explorez les formations et écoles éligibles.", "step": "1", "title": "Choisissez une formation"}, {"body": "Complétez votre dossier et effectuez le paiement des frais de dossier.", "step": "2", "title": "Déposez votre demande"}, {"body": "Téléchargez votre document depuis votre espace personnel.", "step": "3", "title": "Recevez votre attestation"}], "sectionTitle": "Comment obtenir une bourse ?", "sectionSubtitle": "Obtenez votre bourse en 3 étapes simples."}	2026-07-11 15:02:42.091
home_partner_section	{"title": "Écoles éligibles aux bourses", "ctaHref": "/ecoles", "ctaLabel": "Toutes les ecoles", "subtitle": "Formations couvertes par une bourse partenaire."}	2026-07-11 15:02:42.091
why_choose	{"title": "Pourquoi BourseFi", "kicker": "Avantages", "reasons": [{"title": "Trouvez une bourse rapidement"}, {"title": "Candidatez en ligne"}, {"title": "Suivez votre dossier"}, {"title": "Téléchargez votre attestation"}]}	2026-07-11 15:02:42.091
financement	{"steps": [{"body": "Elles orientent les jeunes du territoire, vérifient l'éligibilité locale et peuvent recommander des dossiers aux partenaires financiers du dispositif.", "icon": "location_city", "actor": "Mairies", "title": "Rôle des mairies"}, {"body": "Les agences accompagnent les familles : information sur les formations, pré-contrôle des pièces et mise en relation avec les bailleurs.", "icon": "handshake", "actor": "Agences", "title": "Agences partenaires"}, {"body": "Les bailleurs valident le financement selon des critères publiés (niveau, filière, budget). Chaque décision est historisée pour plus de transparence.", "icon": "account_balance", "actor": "Bailleurs", "title": "Bailleurs & validation"}, {"body": "Le traitement suit des étapes standardisées : dépôt, analyse, éventuel complément de dossier, puis décision. Vous suivez tout depuis votre tableau de bord.", "icon": "fact_check", "actor": "Processus", "title": "Validation & suivi"}], "title": "Comment fonctionne le financement", "kicker": "Financement", "subtitle": "Un modèle clair qui relie territoires, partenaires et bailleurs, jusqu'à l'attestation officielle.", "closureBody": "Une fois votre dossier validé par le partenaire financier (mairie, agence ou bailleur institutionnel), l'attestation est émise sur la plateforme. Vous la téléchargez depuis votre espace pour la présenter à l'établissement — preuve claire et traçable de votre financement.", "closureTitle": "Attestation finale du bailleur"}	2026-07-11 15:02:42.092
espace_etudiant	{"title": "Votre dossier, clair et à jour", "kicker": "Espace étudiant", "ctaHref": "/auth/register", "ctaLabel": "Créer un compte gratuitement", "features": [{"icon": "dashboard", "text": "Vos candidatures, échéances et prochaines actions en un coup d'œil.", "title": "Tableau de bord unifié"}, {"icon": "timeline", "text": "Dépôt, analyse, compléments et décision — chaque étape est visible.", "title": "Suivi en temps réel"}, {"icon": "folder_open", "text": "Attestations et reçus disponibles dès validation, prêts à télécharger.", "title": "Documents centralisés"}, {"icon": "notifications_active", "text": "Soyez prévenu dès qu'une action est requise sur votre dossier.", "title": "Alertes utiles"}], "subtitle": "Visualisez votre parcours candidat : statuts, documents et notifications, sur ordinateur ou mobile."}	2026-07-11 15:02:42.092
partners_strip	{"title": "Logos des partenaires", "kicker": "Partenaires financeurs", "subtitle": "Mairies, agences et bailleurs qui financent les bourses sur la plateforme."}	2026-07-11 15:02:42.093
landing_metiers	{"title": "Débouchés populaires", "kicker": "Orientation", "footnote": "Les fourchettes sont indicatives (FCFA / an, Dakar et grandes villes) et évoluent selon l'expérience.", "subtitle": "Des parcours alignés sur la demande des entreprises et institutions au Sénégal et en Afrique de l'Ouest."}	2026-07-11 15:02:42.093
faq_section	{"title": "Questions fréquentes", "kicker": "FAQ"}	2026-07-11 15:02:42.094
testimonials_section	{"title": "Ils utilisent BourseFi au quotidien", "kicker": "Retours d'expérience"}	2026-07-11 15:02:42.094
orientation_page	{"heroTitle": "Trouver votre voie professionnelle avec BourseFi", "guidesTitle": "Guides métiers", "heroImageKey": "heroOrientation", "heroSubtitle": "Parcourez les métiers d’avenir reliés au catalogue de formations financées, puis affinez avec la comparaison ou la procédure de bourse sur chaque programme.", "domainsHeading": "Domaines d’orientation", "guidesSubtitle": "Contenus alignés sur le même référentiel que vos filtres parcours  dans le catalogue.", "comparisonTitle": "Comparaison côte à côte", "comparisonCtaHref": "/comparaison", "comparisonCtaLabel": "Ouvrir l’outil de comparaison", "comparisonImageKey": "comparisonSection", "comparisonSubtitle": "Sélectionnez jusqu’à quatre programmes réels du catalogue et comparez frais, durée, bailleur et débouchés."}	2026-07-11 15:02:42.094
metiers_hub_page	{"title": "Guide des métiers", "kicker": "Orientation", "footnote": "Les fourchettes salariales sont indicatives et évoluent selon l’expérience et le secteur.", "subtitle": "Chaque fiche relie un parcours professionnel aux formations financées sur la plateforme. Les contenus s’appuient sur le même référentiel que le catalogue des programmes.", "heroImageKey": "heroMetiersHub"}	2026-07-11 15:02:42.094
\.


--
-- Data for Name: TestimonialItem; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."TestimonialItem" (id, "sortOrder", published, initials, name, role, quote, "avatarUrl", "ecoleNom", "partenaireNom") FROM stdin;
cmrghud2v00wtgny41rdx4d6m	0	t	AD	Aminata D.	Étudiante en data, Pikine	On voyait enfin où en était le dossier. Plus besoin de rappeler l'agence tous les jours : tout est sur le téléphone.	\N	ESP	Mairie de Dakar
cmrghud2v00wugny4zwds7nxx	1	t	MK	Moussa K.	Parent, Saint-Louis	Les étapes étaient claires pour les documents et les frais. L'attestation téléchargeable nous a rassurés avant la rentrée.	\N	UCAD	Mairie de Dakar
cmrghud2v00wvgny4a6vei3s1	2	t	IPE	Institut partenaire · Dakar	Service admissions	Les dossiers arrivent complets et tracés. On gagne du temps côté validation avec les bailleurs du programme.	\N	\N	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public."User" (id, name, email, "passwordHash", role, "partnerId", "createdAt", "updatedAt", address, "firstName", "identityCardRectoUrl", "identityCardVersoUrl", "lastName", phone, "bacTranscriptUrl", "bfemAttestationUrl", "emailVerificationToken", "emailVerified") FROM stdin;
cmrktb9jt0002jla9iieuw0tz	fhb ckdb	ada@gmail.com	$2b$10$Bqrb4x8k8mN1Bd80Fhdy1ObNNXEkHDHpCqkV85C5z0ivCF.ZA9Jf.	STUDENT	\N	2026-07-14 15:34:51.162	2026-07-14 15:34:51.162	\N	fhb	\N	\N	ckdb	\N	\N	\N	2c47ecec4875933f839f5208fbb47686e591dfe801c36c5e0d499822663e106a	f
cmrkuaoau0005jla95eecrxbp	fhb ckdb	ad1a@gmail.com	$2b$10$TEs8Gc5c607UyxwY04XJxOQ15c3FHX2DewRh7n5IPqjN5Sx8vty3e	STUDENT	\N	2026-07-14 16:02:23.238	2026-07-14 16:02:23.238	\N	fhb	\N	\N	ckdb	\N	\N	\N	649edd182d60de962d4f9d0af07e27a7a154fc41e3fddb396f8efee14c87edaa	f
cmrkubf6m0008jla9dasm5yf2	bibi viii	bintotehju@gmail.com	$2b$10$y5fVNrYk6gGbgwMEW65Lc.nlJnC8/Qb3yKTwrgHhiu0DqZC0KY5cO	STUDENT	\N	2026-07-14 16:02:58.078	2026-07-14 16:02:58.078	\N	bibi	\N	\N	viii	\N	\N	\N	fd1dbce9fe70ca09afd43e156bda8b443fac4cd0d38055624ecada99e67e0af2	f
cmrkucfy0000bjla9juxbqyfh	bibi viii	bintotehjujk@gmail.com	$2b$10$fIBJYlNXJK/GisVWtMkzpOuyim3ozLuZGHaCVd6ln64L6O0TZDdGy	STUDENT	\N	2026-07-14 16:03:45.719	2026-07-14 16:03:45.719	\N	bibi	\N	\N	viii	\N	\N	\N	1b89345fa4478f0088c3992459e24d8e4c923c7d2ac09c757a91ba1ab490716a	f
cmrkuezez000ejla90zsh4nha	bibi viii	lbintotehjujk@gmail.com	$2b$10$22k7k/5Cx3YoRVESixSC4O2n3QQkmyafC0HP36ouqybqJ5yIs6NfK	STUDENT	\N	2026-07-14 16:05:44.266	2026-07-14 16:05:44.266	\N	bibi	\N	\N	viii	\N	\N	\N	d778b737cc3b58a81d1f69c9b22523dd484988621ba29af21f88e1c495052a90	f
cmrkungd9000hjla9wg5zzdr2	bibi viii	lbintotmlehjujk@gmail.com	$2b$10$cnGwmOtaym/48QyJr9fZG.4fBsEOIVDZ2fgbWDeUP2MJrw6GMUCFq	STUDENT	\N	2026-07-14 16:12:19.486	2026-07-14 16:12:19.486	\N	bibi	\N	\N	viii	\N	\N	\N	4527c0e6dd87bbb0b8510174dd4c5a0e2fd04d2904cd94a225cae442a658f071	f
cmrlzgakl000kjla9mc5gxkev	prooipo pirpirj	pribotsm@gmail.com	$2b$10$atPaYwWO5ToePU5J378OeOVXuWp7oVKCsFumyhPg7KYCwvvqzHBSy	STUDENT	\N	2026-07-15 11:14:29.637	2026-07-15 11:14:29.637	\N	prooipo	\N	\N	pirpirj	\N	\N	\N	c24ff217be7084e8491ae562f705392d7f363676ee0da023b5c43358716cb38c	f
cmrlzh509000njla91ig698rj	prooipo pirpirj	pribotsjm@gmail.com	$2b$10$J4C/q2oJNdBw09l/CvtfvuThTsGliR10wf2qaNpaixTvedJjd8LhC	STUDENT	\N	2026-07-15 11:15:09.081	2026-07-15 11:15:09.081	\N	prooipo	\N	\N	pirpirj	\N	\N	\N	0037f1038b37e2b989d1645ea30924c96c4538b02989e9fdeac73d2984f25ad5	f
cmrmodbq0000qjla94wiyn9cz	ndeya nnn	test@tesndeeet.sn	$2b$10$wYIqLQj42lV50lzHcQE3wOCFEJB82aPEqHHNxhl6sVwbQjzwLEi7a	STUDENT	\N	2026-07-15 22:52:01.56	2026-07-15 23:14:03.478	Dakar	ndeya	/uploads/users/cmrmodbq0000qjla94wiyn9cz/cni-recto.jpg	/uploads/users/cmrmodbq0000qjla94wiyn9cz/cni-verso.jpg	nnn	776333333333	/uploads/users/cmrmodbq0000qjla94wiyn9cz/bac.pdf	/uploads/users/cmrmodbq0000qjla94wiyn9cz/bfem.pdf	\N	t
cmrmp74xy0015jla9ykxtcfgy	jgc hc	ch@gn.vn	$2b$10$TyFkcHUpqH5d554/B2DLH.F7msoQ.betHrcEloa/GAxeXIj4/uaCS	STUDENT	\N	2026-07-15 23:15:12.455	2026-07-15 23:15:12.812	\N	jgc	\N	\N	hc	\N	\N	\N	\N	t
cmrmpnz3k0006gp1j2fh7dj65	gj j	ch@gn.gvn	$2b$10$ABxJ8XDo5bPQIrZ4NiOiresz/fl22wOkTclhs949dpwedxyR4i88G	STUDENT	\N	2026-07-15 23:28:18.032	2026-07-15 23:28:18.457	\N	gj	\N	\N	j	6666666	\N	\N	\N	t
cmrghucri00gmgny4iiwv2ycc	Admin BourseFi	admin@boursefi.sn	$2b$10$RLgdK2S9ywV/y3KrB3HJm.honLbqoeD4MN1CUHTt0WeCgdQQQQFiO	ADMIN	\N	2026-07-11 15:02:41.695	2026-07-25 16:30:59.199	\N	\N	\N	\N	\N	\N	\N	\N	\N	t
cmrghucti00gogny40bsg34vv	Partenaire BourseFi	partenaire@boursefi.sn	$2b$10$qFM4c1aWCNH3E9h/HIAihuJ9wuqxJ0zeoTcmoHUZC01H.pfowjYdW	PARTNER	cmrghoxmf0000gnzbjfp0btij	2026-07-11 15:02:41.766	2026-07-25 16:30:59.274	\N	\N	\N	\N	\N	\N	\N	\N	\N	t
cmrghucve00gqgny428i4nztk	Etudiant Demo	etudiant@boursefi.sn	$2b$10$pFsXF.G2BtuS7Ln48J7gPOJ79noXw/SkpYIA0WofRheh3rYtnAwhW	STUDENT	\N	2026-07-11 15:02:41.835	2026-07-25 16:30:59.275	\N	\N	\N	\N	\N	\N	\N	\N	\N	t
cmrhubklb0000gnv47keig422	Admin BourseFi	zeynash1@gmail.com	$2b$10$oiGcBuVTgOT971Tyrham6.9aletfk34CK9gyVtwY0Wu/9JfJvvOFi	ADMIN	\N	2026-07-12 13:39:46.558	2026-07-25 16:36:10.938	Dakar	SEynabou	/uploads/users/cmrhubklb0000gnv47keig422/cni-recto.jpg	/uploads/users/cmrhubklb0000gnv47keig422/cni-verso.jpg	DIeng	777777777	/uploads/users/cmrhubklb0000gnv47keig422/bac.jpg	/uploads/users/cmrhubklb0000gnv47keig422/bfem.jpg	\N	t
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Bourse Bourse_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Bourse"
    ADD CONSTRAINT "Bourse_pkey" PRIMARY KEY (id);


--
-- Name: Candidature Candidature_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Candidature"
    ADD CONSTRAINT "Candidature_pkey" PRIMARY KEY (id);


--
-- Name: ContactMessage ContactMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."ContactMessage"
    ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);


--
-- Name: Etablissement Etablissement_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Etablissement"
    ADD CONSTRAINT "Etablissement_pkey" PRIMARY KEY (id);


--
-- Name: FaqItem FaqItem_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."FaqItem"
    ADD CONSTRAINT "FaqItem_pkey" PRIMARY KEY (id);


--
-- Name: MetierPage MetierPage_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."MetierPage"
    ADD CONSTRAINT "MetierPage_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Paiement Paiement_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Paiement"
    ADD CONSTRAINT "Paiement_pkey" PRIMARY KEY (id);


--
-- Name: Partner Partner_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_pkey" PRIMARY KEY (id);


--
-- Name: Programme Programme_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Programme"
    ADD CONSTRAINT "Programme_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SiteContent SiteContent_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."SiteContent"
    ADD CONSTRAINT "SiteContent_pkey" PRIMARY KEY (key);


--
-- Name: TestimonialItem TestimonialItem_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."TestimonialItem"
    ADD CONSTRAINT "TestimonialItem_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: Bourse_isActive_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Bourse_isActive_idx" ON public."Bourse" USING btree ("isActive");


--
-- Name: Bourse_partnerId_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Bourse_partnerId_idx" ON public."Bourse" USING btree ("partnerId");


--
-- Name: Bourse_programmeId_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Bourse_programmeId_idx" ON public."Bourse" USING btree ("programmeId");


--
-- Name: Bourse_slug_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "Bourse_slug_key" ON public."Bourse" USING btree (slug);


--
-- Name: Candidature_bourseId_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Candidature_bourseId_idx" ON public."Candidature" USING btree ("bourseId");


--
-- Name: Candidature_partnerId_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Candidature_partnerId_idx" ON public."Candidature" USING btree ("partnerId");


--
-- Name: Candidature_programmeId_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Candidature_programmeId_idx" ON public."Candidature" USING btree ("programmeId");


--
-- Name: Candidature_status_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Candidature_status_idx" ON public."Candidature" USING btree (status);


--
-- Name: Etablissement_slug_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "Etablissement_slug_key" ON public."Etablissement" USING btree (slug);


--
-- Name: MetierPage_slug_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "MetierPage_slug_key" ON public."MetierPage" USING btree (slug);


--
-- Name: Notification_readAt_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Notification_readAt_idx" ON public."Notification" USING btree ("readAt");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Paiement_candidatureId_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "Paiement_candidatureId_key" ON public."Paiement" USING btree ("candidatureId");


--
-- Name: Paiement_refCommand_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "Paiement_refCommand_key" ON public."Paiement" USING btree ("refCommand");


--
-- Name: Paiement_userId_idx; Type: INDEX; Schema: public; Owner: mac
--

CREATE INDEX "Paiement_userId_idx" ON public."Paiement" USING btree ("userId");


--
-- Name: Partner_slug_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "Partner_slug_key" ON public."Partner" USING btree (slug);


--
-- Name: Programme_slug_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "Programme_slug_key" ON public."Programme" USING btree (slug);


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: User_emailVerificationToken_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON public."User" USING btree ("emailVerificationToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AuditLog AuditLog_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Bourse Bourse_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Bourse"
    ADD CONSTRAINT "Bourse_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Bourse Bourse_programmeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Bourse"
    ADD CONSTRAINT "Bourse_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES public."Programme"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Candidature Candidature_bourseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Candidature"
    ADD CONSTRAINT "Candidature_bourseId_fkey" FOREIGN KEY ("bourseId") REFERENCES public."Bourse"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Candidature Candidature_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Candidature"
    ADD CONSTRAINT "Candidature_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Candidature Candidature_programmeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Candidature"
    ADD CONSTRAINT "Candidature_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES public."Programme"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Candidature Candidature_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Candidature"
    ADD CONSTRAINT "Candidature_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Paiement Paiement_candidatureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Paiement"
    ADD CONSTRAINT "Paiement_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES public."Candidature"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Paiement Paiement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Paiement"
    ADD CONSTRAINT "Paiement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Programme Programme_etablissementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Programme"
    ADD CONSTRAINT "Programme_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES public."Etablissement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Programme Programme_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Programme"
    ADD CONSTRAINT "Programme_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 557WOd9zMFLzL5hZnK1Zh9xP0aSdFk1adZxMWXzvabCWsfC5gYse9DMKeDHCL1E

