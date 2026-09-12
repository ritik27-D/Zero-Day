-- Clearly labelled, idempotent demo data for the active MVP tables.
-- Research Areas (8 total)
insert into public.research_areas (slug, name, description, is_demo) values
('artificial-intelligence', 'Artificial Intelligence', 'DEMO DATA: Intelligent systems, responsible AI and applied automation.', true),
('machine-learning', 'Machine Learning', 'DEMO DATA: Data-driven predictive and adaptive systems.', true),
('cybersecurity', 'Cybersecurity', 'DEMO DATA: Digital resilience, network defence and threat research.', true),
('healthcare-technology', 'Healthcare Technology', 'DEMO DATA: Safe, inclusive digital health innovation.', true),
('data-science', 'Data Science', 'DEMO DATA: Big data analytics, statistical modeling, and data-driven insights.', true),
('computer-vision', 'Computer Vision', 'DEMO DATA: Visual sensing, image processing, and perceptual neural models.', true),
('natural-language-processing', 'Natural Language Processing', 'DEMO DATA: Computational linguistics, multilingual text processing, and language models.', true),
('iot-smart-systems', 'IoT & Smart Systems', 'DEMO DATA: Embedded sensor networks, edge intelligence, and smart infrastructure.', true)
on conflict (slug) do update set name=excluded.name, description=excluded.description, is_demo=true;

-- Researchers (10 total)
insert into public.researchers (slug, name, email, title, bio, is_demo) values
('dr-aisha-rahman', 'Dr Aisha Rahman', 'aisha.rahman@demo.islington.edu.np', 'Senior Lecturer, Computing', 'DEMO DATA: Leads applied Artificial Intelligence research for public good and machine learning governance.', true),
('niran-shrestha', 'Niran Shrestha', 'niran.shrestha@demo.islington.edu.np', 'Lecturer, Cybersecurity', 'DEMO DATA: Researches AI-assisted cyber defence, network security, and adversarial anomaly detection.', true),
('maya-gurung', 'Maya Gurung', 'maya.gurung@demo.islington.edu.np', 'Research Fellow, Data Science', 'DEMO DATA: Applies machine learning and statistical modeling to healthcare datasets and clinical outcomes.', true),
('leela-karki', 'Leela Karki', 'leela.karki@demo.islington.edu.np', 'Healthcare Technology Fellow', 'DEMO DATA: Designs equitable digital healthcare services, clinical AI interfaces, and patient monitoring systems.', true),
('dr-bikash-adhikari', 'Dr Bikash Adhikari', 'bikash.adhikari@demo.islington.edu.np', 'Associate Professor, Computer Vision', 'DEMO DATA: Investigates real-time visual perception, medical radiology screening, and convolutional image analysis.', true),
('anjali-tamang', 'Anjali Tamang', 'anjali.tamang@demo.islington.edu.np', 'Lecturer, Natural Language Processing', 'DEMO DATA: Specializes in low-resource computational linguistics, cross-lingual transfer, and multilingual NLP.', true),
('prabin-joshi', 'Prabin Joshi', 'prabin.joshi@demo.islington.edu.np', 'Senior Lecturer, IoT & Embedded Systems', 'DEMO DATA: Develops resilient edge-computing architectures, low-power sensing, and smart agricultural telemetry.', true),
('sunita-sharma', 'Sunita Sharma', 'sunita.sharma@demo.islington.edu.np', 'Research Fellow, Applied AI', 'DEMO DATA: Researches trustworthy machine learning, reinforcement learning, and resilient decision-making systems.', true),
('rohan-thapa', 'Rohan Thapa', 'rohan.thapa@demo.islington.edu.np', 'Lecturer, Cloud & Security', 'DEMO DATA: Researches zero-trust cloud architectures, continuous identity verification, and IoT communication security.', true),
('deepa-bhattarai', 'Deepa Bhattarai', 'deepa.bhattarai@demo.islington.edu.np', 'Data Science Fellow', 'DEMO DATA: Specializes in predictive healthcare analytics, sequential patient biosignals, and clinical epidemiology.', true)
on conflict (slug) do update set name=excluded.name, email=excluded.email, title=excluded.title, bio=excluded.bio, is_demo=true;

-- Projects (7 total)
insert into public.projects (slug, title, description, status, start_date, is_demo) values
('sentinel-ai-ids', 'Sentinel: AI-Based Intrusion Detection for Campus Networks', 'DEMO DATA: A project using machine learning to identify network anomalies and support cyber analysts.', 'ongoing', '2026-01-15', true),
('carepath-ai', 'CarePath AI Triage Explorer', 'DEMO DATA: Exploring explainable AI-supported healthcare triage and patient prioritization.', 'planned', '2026-08-01', true),
('visionmed-xray', 'VisionMed: Automated Chest Radiograph Diagnostic Assistant', 'DEMO DATA: Developing lightweight computer vision models to detect pulmonary conditions in resource-constrained clinics.', 'ongoing', '2026-02-01', true),
('agro-edge-iot', 'AgroEdge: Resilient Low-Power Soil Monitoring Network', 'DEMO DATA: Solar-powered edge IoT nodes predicting micro-climate changes for sustainable Himalayan agriculture.', 'ongoing', '2026-03-10', true),
('nepali-lingua-llm', 'LinguaNepal: Speech and Text Corpus for Low-Resource Languages', 'DEMO DATA: Curating open-access multilingual datasets and acoustic models for indigenous linguistic preservation.', 'ongoing', '2026-01-20', true),
('zerotrust-cloudsec', 'ZeroTrust-Cloud: Adaptive Identity Verification Framework', 'DEMO DATA: Evaluated dynamic context-based authentication protocols against credential-stuffing attacks.', 'completed', '2025-06-01', true),
('neuroflow-analytics', 'NeuroFlow: Predictive ICU Patient Deterioration Monitoring', 'DEMO DATA: High-throughput telemetry streaming framework combining biosensors and sequential neural networks.', 'planned', '2026-09-01', true)
on conflict (slug) do update set title=excluded.title, description=excluded.description, status=excluded.status, start_date=excluded.start_date, is_demo=true;

-- Publications (11 total)
insert into public.publications (slug, title, abstract, status, venue, doi, published_at, is_demo) values
('explainable-ai-intrusion-detection', 'Explainable AI for Campus Intrusion Detection', 'DEMO DATA: A study of interpretable anomaly detection for higher-education networks.', 'published', 'DEMO International Journal of Applied Cybersecurity', '10.9999/demo.sentinel.2026', '2026-05-10', true),
('responsible-triage-models', 'Responsible Triage Models for Community Clinics', 'DEMO DATA: An early research manuscript on accountable digital health AI and fairness verification.', 'submitted', 'DEMO Conference on Healthcare Technology', null, null, true),
('deep-learning-chest-radiology', 'Deep Convolutional Networks for Rapid Pulmonary Screening', 'DEMO DATA: Validating transfer learning techniques on portable chest X-ray devices with minimal inference latency.', 'published', 'DEMO Journal of Medical Imaging & Diagnostics', '10.9999/demo.visionmed.2026', '2026-04-15', true),
('sub-watt-edge-sensors', 'Sub-Watt Edge Neural Inference for Environmental Sensing', 'DEMO DATA: Benchmarking quantized neural models on microcontroller nodes under intermittent solar harvesting.', 'published', 'DEMO IEEE Internet of Things Workshop', '10.9999/demo.agroedge.2026', '2026-06-20', true),
('cross-lingual-transfer-nlp', 'Cross-Lingual Transfer Learning for Low-Resource Himalayan Languages', 'DEMO DATA: Demonstrating zero-shot linguistic transfer using sentence embeddings across regional dialects.', 'published', 'DEMO Asian Conference on Natural Language Processing', '10.9999/demo.lingua.2026', '2026-05-28', true),
('continuous-auth-cloud', 'Continuous Contextual Authentication in Distributed Cloud Architectures', 'DEMO DATA: Experimental validation of behavioral biometric telemetry to mitigate privilege escalation in multi-tenant environments.', 'published', 'DEMO Journal of Cloud Security & Trust', '10.9999/demo.zerotrust.2025', '2025-11-12', true),
('transformer-icu-telemetry', 'Temporal Transformers for Real-Time Septic Shock Prediction', 'DEMO DATA: A multi-modal attention architecture integrating arterial waveforms with laboratory telemetry in intensive care units.', 'submitted', 'DEMO International Conference on Digital Health Intelligence', null, null, true),
('adversarial-robustness-ids', 'Adversarial Robustness in Graph Neural Network Intrusion Detectors', 'DEMO DATA: Assessing network evasion attack patterns against topological feature embeddings in campus intranets.', 'published', 'DEMO ACM Workshop on Security and Artificial Intelligence', '10.9999/demo.advids.2026', '2026-03-02', true),
('multimodal-medical-vision', 'Self-Supervised Pretraining for Multi-Modal Clinical Diagnostics', 'DEMO DATA: Investigating contrastive visual-linguistic pairings to assist diagnostic radiology reporting with confidence intervals.', 'submitted', 'DEMO European Conference on Computer Vision in Medicine', null, null, true),
('privacy-preserving-federated-health', 'Federated Learning Protocols for Privacy-Preserving Health Analytics', 'DEMO DATA: Differential privacy bounds in decentralized clinical model training without raw patient record exchange.', 'submitted', 'DEMO Journal of Health Information Security', null, null, true),
('edge-anomaly-detection-iot', 'Lightweight Anomaly Detection for LoRaWAN Agricultural Gateways', 'DEMO DATA: Compact isolation forests running on gateway firmware to filter spoofed environmental telemetry packets.', 'published', 'DEMO Sensors & Actuators Colloquium', '10.9999/demo.loraedge.2026', '2026-02-18', true)
on conflict (slug) do update set title=excluded.title, abstract=excluded.abstract, status=excluded.status, venue=excluded.venue, doi=excluded.doi, published_at=excluded.published_at, is_demo=true;

-- Relationship: Researcher <-> Research Area
insert into public.researcher_research_areas (researcher_id, research_area_id)
select r.id, a.id
from (values
  ('dr-aisha-rahman', 'artificial-intelligence'),
  ('dr-aisha-rahman', 'machine-learning'),
  ('dr-aisha-rahman', 'computer-vision'),
  ('niran-shrestha', 'artificial-intelligence'),
  ('niran-shrestha', 'cybersecurity'),
  ('niran-shrestha', 'iot-smart-systems'),
  ('maya-gurung', 'machine-learning'),
  ('maya-gurung', 'healthcare-technology'),
  ('maya-gurung', 'data-science'),
  ('leela-karki', 'artificial-intelligence'),
  ('leela-karki', 'healthcare-technology'),
  ('leela-karki', 'data-science'),
  ('dr-bikash-adhikari', 'artificial-intelligence'),
  ('dr-bikash-adhikari', 'computer-vision'),
  ('dr-bikash-adhikari', 'healthcare-technology'),
  ('anjali-tamang', 'artificial-intelligence'),
  ('anjali-tamang', 'natural-language-processing'),
  ('anjali-tamang', 'data-science'),
  ('prabin-joshi', 'iot-smart-systems'),
  ('prabin-joshi', 'cybersecurity'),
  ('prabin-joshi', 'data-science'),
  ('sunita-sharma', 'artificial-intelligence'),
  ('sunita-sharma', 'machine-learning'),
  ('sunita-sharma', 'cybersecurity'),
  ('rohan-thapa', 'cybersecurity'),
  ('rohan-thapa', 'iot-smart-systems'),
  ('rohan-thapa', 'data-science'),
  ('deepa-bhattarai', 'data-science'),
  ('deepa-bhattarai', 'healthcare-technology'),
  ('deepa-bhattarai', 'machine-learning')
) as map(researcher_slug, area_slug)
join public.researchers r on r.slug = map.researcher_slug
join public.research_areas a on a.slug = map.area_slug
on conflict do nothing;

-- Relationship: Project <-> Researcher
insert into public.project_researchers (project_id, researcher_id)
select p.id, r.id
from (values
  ('sentinel-ai-ids', 'dr-aisha-rahman'),
  ('sentinel-ai-ids', 'niran-shrestha'),
  ('sentinel-ai-ids', 'maya-gurung'),
  ('sentinel-ai-ids', 'sunita-sharma'),
  ('carepath-ai', 'dr-aisha-rahman'),
  ('carepath-ai', 'maya-gurung'),
  ('carepath-ai', 'leela-karki'),
  ('carepath-ai', 'deepa-bhattarai'),
  ('visionmed-xray', 'dr-bikash-adhikari'),
  ('visionmed-xray', 'dr-aisha-rahman'),
  ('visionmed-xray', 'leela-karki'),
  ('agro-edge-iot', 'prabin-joshi'),
  ('agro-edge-iot', 'rohan-thapa'),
  ('agro-edge-iot', 'maya-gurung'),
  ('nepali-lingua-llm', 'anjali-tamang'),
  ('nepali-lingua-llm', 'dr-aisha-rahman'),
  ('nepali-lingua-llm', 'sunita-sharma'),
  ('zerotrust-cloudsec', 'rohan-thapa'),
  ('zerotrust-cloudsec', 'niran-shrestha'),
  ('zerotrust-cloudsec', 'prabin-joshi'),
  ('neuroflow-analytics', 'deepa-bhattarai'),
  ('neuroflow-analytics', 'dr-bikash-adhikari'),
  ('neuroflow-analytics', 'maya-gurung')
) as map(project_slug, researcher_slug)
join public.projects p on p.slug = map.project_slug
join public.researchers r on r.slug = map.researcher_slug
on conflict do nothing;

-- Relationship: Publication <-> Researcher
insert into public.publication_researchers (publication_id, researcher_id)
select pub.id, r.id
from (values
  ('explainable-ai-intrusion-detection', 'dr-aisha-rahman'),
  ('explainable-ai-intrusion-detection', 'niran-shrestha'),
  ('explainable-ai-intrusion-detection', 'maya-gurung'),
  ('responsible-triage-models', 'maya-gurung'),
  ('responsible-triage-models', 'leela-karki'),
  ('responsible-triage-models', 'deepa-bhattarai'),
  ('deep-learning-chest-radiology', 'dr-bikash-adhikari'),
  ('deep-learning-chest-radiology', 'dr-aisha-rahman'),
  ('deep-learning-chest-radiology', 'leela-karki'),
  ('sub-watt-edge-sensors', 'prabin-joshi'),
  ('sub-watt-edge-sensors', 'rohan-thapa'),
  ('cross-lingual-transfer-nlp', 'anjali-tamang'),
  ('cross-lingual-transfer-nlp', 'dr-aisha-rahman'),
  ('continuous-auth-cloud', 'rohan-thapa'),
  ('continuous-auth-cloud', 'niran-shrestha'),
  ('transformer-icu-telemetry', 'deepa-bhattarai'),
  ('transformer-icu-telemetry', 'maya-gurung'),
  ('adversarial-robustness-ids', 'niran-shrestha'),
  ('adversarial-robustness-ids', 'sunita-sharma'),
  ('multimodal-medical-vision', 'dr-bikash-adhikari'),
  ('multimodal-medical-vision', 'deepa-bhattarai'),
  ('privacy-preserving-federated-health', 'leela-karki'),
  ('privacy-preserving-federated-health', 'sunita-sharma'),
  ('edge-anomaly-detection-iot', 'prabin-joshi'),
  ('edge-anomaly-detection-iot', 'niran-shrestha')
) as map(publication_slug, researcher_slug)
join public.publications pub on pub.slug = map.publication_slug
join public.researchers r on r.slug = map.researcher_slug
on conflict do nothing;

-- Relationship: Project <-> Publication
insert into public.project_publications (project_id, publication_id)
select p.id, pub.id
from (values
  ('sentinel-ai-ids', 'explainable-ai-intrusion-detection'),
  ('sentinel-ai-ids', 'adversarial-robustness-ids'),
  ('carepath-ai', 'responsible-triage-models'),
  ('carepath-ai', 'privacy-preserving-federated-health'),
  ('visionmed-xray', 'deep-learning-chest-radiology'),
  ('visionmed-xray', 'multimodal-medical-vision'),
  ('agro-edge-iot', 'sub-watt-edge-sensors'),
  ('agro-edge-iot', 'edge-anomaly-detection-iot'),
  ('nepali-lingua-llm', 'cross-lingual-transfer-nlp'),
  ('zerotrust-cloudsec', 'continuous-auth-cloud'),
  ('neuroflow-analytics', 'transformer-icu-telemetry')
) as map(project_slug, publication_slug)
join public.projects p on p.slug = map.project_slug
join public.publications pub on pub.slug = map.publication_slug
on conflict do nothing;

-- Relationship: Project <-> Research Area
insert into public.project_research_areas (project_id, research_area_id)
select p.id, a.id
from (values
  ('sentinel-ai-ids', 'artificial-intelligence'),
  ('sentinel-ai-ids', 'machine-learning'),
  ('sentinel-ai-ids', 'cybersecurity'),
  ('carepath-ai', 'artificial-intelligence'),
  ('carepath-ai', 'machine-learning'),
  ('carepath-ai', 'healthcare-technology'),
  ('carepath-ai', 'data-science'),
  ('visionmed-xray', 'artificial-intelligence'),
  ('visionmed-xray', 'computer-vision'),
  ('visionmed-xray', 'healthcare-technology'),
  ('agro-edge-iot', 'iot-smart-systems'),
  ('agro-edge-iot', 'data-science'),
  ('agro-edge-iot', 'machine-learning'),
  ('nepali-lingua-llm', 'artificial-intelligence'),
  ('nepali-lingua-llm', 'natural-language-processing'),
  ('nepali-lingua-llm', 'data-science'),
  ('zerotrust-cloudsec', 'cybersecurity'),
  ('zerotrust-cloudsec', 'iot-smart-systems'),
  ('neuroflow-analytics', 'healthcare-technology'),
  ('neuroflow-analytics', 'data-science'),
  ('neuroflow-analytics', 'machine-learning')
) as map(project_slug, area_slug)
join public.projects p on p.slug = map.project_slug
join public.research_areas a on a.slug = map.area_slug
on conflict do nothing;
