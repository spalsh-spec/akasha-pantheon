/* ============================================================
   VACIS-helper · medication database
   ~100 common Australian medications · brand + generic mapping.
   Sources cross-referenced against:
     - TGA Australian Register of Therapeutic Goods (ARTG)
     - PBS Schedule of Pharmaceutical Benefits
     - AV CPG 2024 drug list (paramedic-administered drugs flagged)
   Last reviewed: 2026-05-11.

   NOT A SUBSTITUTE FOR THE CURRENT AV CPGs.
   Confirm dose, contraindications, and currency at the point of care.
   ============================================================ */
window.VACIS_MEDS = [

  /* ============== PARAMEDIC-ADMINISTERED (AV ALS / MICA) ============== */
  // Analgesia
  { generic: 'Paracetamol',        brand: ['Panadol', 'Panamax', 'Dymadon'],         class: 'Analgesic',           para: true,  notes: '1g PO; or 15mg/kg IV (MICA)' },
  { generic: 'Methoxyflurane',     brand: ['Penthrox'],                              class: 'Analgesic (inhaled)', para: true,  notes: '3mL inhaler, max 6mL/day' },
  { generic: 'Morphine',           brand: ['MS Contin', 'Ordine', 'Anamorph'],       class: 'Opioid analgesic',    para: true,  notes: 'IV/IM/SC titrated to effect' },
  { generic: 'Fentanyl',           brand: ['Sublimaze'],                             class: 'Opioid analgesic',    para: true,  notes: 'IV/IN/IM, faster onset than morphine' },
  { generic: 'Ketamine',           brand: ['Ketalar'],                               class: 'NMDA antagonist',     para: true,  notes: 'Analgesic doses 0.1–0.3mg/kg IV' },
  // Cardiac
  { generic: 'Aspirin',            brand: ['Astrix', 'Cardiprin', 'Cartia', 'Disprin'], class: 'Antiplatelet',     para: true,  notes: '300mg PO for suspected ACS' },
  { generic: 'Glyceryl trinitrate', brand: ['GTN', 'Anginine', 'Nitrolingual'],      class: 'Nitrate vasodilator', para: true,  notes: '0.4mg SL spray or 600mcg tab' },
  // Respiratory
  { generic: 'Salbutamol',         brand: ['Ventolin', 'Asmol', 'Airomir'],          class: 'β2 agonist',          para: true,  notes: 'Nebulised 5mg or pMDI 4–8 puffs' },
  { generic: 'Ipratropium',        brand: ['Atrovent'],                              class: 'Anticholinergic',     para: true,  notes: 'Nebulised 500mcg with salbutamol' },
  // Allergy / anaphylaxis
  { generic: 'Adrenaline',         brand: ['EpiPen', 'Anapen'],                      class: 'Sympathomimetic',     para: true,  notes: 'IM 0.5mg adult / 0.15mg child; IV (MICA only)' },
  { generic: 'Hydrocortisone',     brand: ['Solu-Cortef'],                           class: 'Corticosteroid',      para: true,  notes: 'IV 200mg post-adrenaline' },
  // Glucose / overdose
  { generic: 'Glucose 10%',        brand: ['Glucose 10%'],                           class: 'Carbohydrate',        para: true,  notes: 'IV 100–250mL for hypoglycaemia' },
  { generic: 'Glucagon',           brand: ['GlucaGen'],                              class: 'Hormone',             para: true,  notes: 'IM 1mg if no IV access' },
  { generic: 'Naloxone',           brand: ['Narcan', 'Prenoxad'],                    class: 'Opioid antagonist',   para: true,  notes: 'IM/IV/IN titrated' },
  // Antiemetics
  { generic: 'Ondansetron',        brand: ['Zofran'],                                class: 'Antiemetic',          para: true,  notes: 'IV/IM/PO 4–8mg' },
  { generic: 'Metoclopramide',     brand: ['Maxolon'],                               class: 'Antiemetic',          para: true,  notes: 'IV/IM 10mg' },
  // Seizures
  { generic: 'Midazolam',          brand: ['Hypnovel'],                              class: 'Benzodiazepine',      para: true,  notes: 'IM/IN/IV for seizure or sedation' },
  // Bleeding
  { generic: 'Tranexamic acid',    brand: ['Cyklokapron'],                           class: 'Antifibrinolytic',    para: true,  notes: 'IV 1g over 10min for major trauma' },
  // MICA-only (RSI / cardiac arrest extras)
  { generic: 'Suxamethonium',      brand: ['Anectine', 'Scoline'],                   class: 'Neuromuscular blocker', para: 'mica', notes: 'RSI 1.5mg/kg IV' },
  { generic: 'Rocuronium',         brand: ['Esmeron'],                               class: 'Neuromuscular blocker', para: 'mica', notes: 'RSI 1.2mg/kg IV' },
  { generic: 'Atropine',           brand: ['Atropt'],                                class: 'Anticholinergic',     para: 'mica', notes: 'IV 0.6mg for symptomatic bradycardia' },
  { generic: 'Amiodarone',         brand: ['Cordarone', 'Aratac'],                   class: 'Antiarrhythmic',      para: 'mica', notes: 'IV 300mg in shockable VF/VT arrest' },
  { generic: 'Metaraminol',        brand: ['Aramine'],                               class: 'Vasopressor',         para: 'mica', notes: 'IV 0.5–1mg titrated' },
  { generic: 'Magnesium sulfate',  brand: ['Magnesium sulfate'],                     class: 'Electrolyte',         para: 'mica', notes: 'IV 2g for torsades / severe asthma' },
  { generic: 'Calcium gluconate',  brand: ['Calcium Gluconate'],                     class: 'Electrolyte',         para: 'mica', notes: 'IV 10mL 10% for hyperK / CCB OD' },
  { generic: 'Sodium bicarbonate', brand: ['Sodibic'],                               class: 'Buffer',              para: 'mica', notes: 'IV 100mmol for TCA OD / severe acidosis' },
  // Fluids
  { generic: 'Normal saline 0.9%', brand: ['NaCl 0.9%'],                             class: 'Crystalloid',         para: true,  notes: 'IV fluid resuscitation' },
  { generic: "Hartmann's solution", brand: ['Compound sodium lactate'],              class: 'Crystalloid',         para: true,  notes: 'IV balanced crystalloid' },

  /* ============== HOME MEDICATIONS — CARDIOVASCULAR ============== */
  { generic: 'Atorvastatin',       brand: ['Lipitor'],                  class: 'Statin' },
  { generic: 'Rosuvastatin',       brand: ['Crestor'],                  class: 'Statin' },
  { generic: 'Simvastatin',        brand: ['Zocor', 'Lipex'],           class: 'Statin' },
  { generic: 'Perindopril',        brand: ['Coversyl'],                 class: 'ACE inhibitor' },
  { generic: 'Ramipril',           brand: ['Tritace'],                  class: 'ACE inhibitor' },
  { generic: 'Lisinopril',         brand: ['Lisodur', 'Zestril'],       class: 'ACE inhibitor' },
  { generic: 'Candesartan',        brand: ['Atacand'],                  class: 'ARB' },
  { generic: 'Irbesartan',         brand: ['Avapro', 'Karvea'],         class: 'ARB' },
  { generic: 'Telmisartan',        brand: ['Micardis'],                 class: 'ARB' },
  { generic: 'Amlodipine',         brand: ['Norvasc'],                  class: 'Calcium channel blocker' },
  { generic: 'Felodipine',         brand: ['Plendil', 'Felodur'],       class: 'Calcium channel blocker' },
  { generic: 'Metoprolol',         brand: ['Betaloc', 'Lopresor', 'Metohexal'], class: 'β-blocker' },
  { generic: 'Atenolol',           brand: ['Tenormin', 'Noten'],        class: 'β-blocker' },
  { generic: 'Bisoprolol',         brand: ['Bicor', 'Bipressil'],       class: 'β-blocker' },
  { generic: 'Carvedilol',         brand: ['Dilatrend', 'Kredex'],      class: 'β-blocker' },
  { generic: 'Frusemide',          brand: ['Lasix', 'Uremide'],         class: 'Loop diuretic' },
  { generic: 'Hydrochlorothiazide', brand: ['Dichlotride'],             class: 'Thiazide diuretic' },
  { generic: 'Spironolactone',     brand: ['Aldactone', 'Spiractin'],   class: 'K-sparing diuretic' },
  { generic: 'Digoxin',            brand: ['Lanoxin'],                  class: 'Cardiac glycoside' },
  { generic: 'Warfarin',           brand: ['Coumadin', 'Marevan'],      class: 'Anticoagulant (VKA)' },
  { generic: 'Apixaban',           brand: ['Eliquis'],                  class: 'Anticoagulant (DOAC)' },
  { generic: 'Rivaroxaban',        brand: ['Xarelto'],                  class: 'Anticoagulant (DOAC)' },
  { generic: 'Dabigatran',         brand: ['Pradaxa'],                  class: 'Anticoagulant (DOAC)' },
  { generic: 'Clopidogrel',        brand: ['Plavix', 'Iscover'],        class: 'Antiplatelet' },
  { generic: 'Ticagrelor',         brand: ['Brilinta'],                 class: 'Antiplatelet' },
  { generic: 'Isosorbide mononitrate', brand: ['Imdur', 'Duride'],      class: 'Nitrate' },

  /* ============== DIABETES ============== */
  { generic: 'Metformin',          brand: ['Diabex', 'Diaformin', 'Glucophage'], class: 'Biguanide' },
  { generic: 'Gliclazide',         brand: ['Diamicron', 'Glyade'],      class: 'Sulfonylurea' },
  { generic: 'Glimepiride',        brand: ['Amaryl'],                   class: 'Sulfonylurea' },
  { generic: 'Sitagliptin',        brand: ['Januvia'],                  class: 'DPP-4 inhibitor' },
  { generic: 'Empagliflozin',      brand: ['Jardiance'],                class: 'SGLT2 inhibitor' },
  { generic: 'Dapagliflozin',      brand: ['Forxiga'],                  class: 'SGLT2 inhibitor' },
  { generic: 'Insulin glargine',   brand: ['Lantus', 'Toujeo'],         class: 'Long-acting insulin' },
  { generic: 'Insulin aspart',     brand: ['NovoRapid'],                class: 'Rapid-acting insulin' },
  { generic: 'Insulin lispro',     brand: ['Humalog'],                  class: 'Rapid-acting insulin' },

  /* ============== RESPIRATORY (chronic) ============== */
  { generic: 'Fluticasone',        brand: ['Flixotide', 'Arnuity'],     class: 'Inhaled corticosteroid' },
  { generic: 'Budesonide',         brand: ['Pulmicort'],                class: 'Inhaled corticosteroid' },
  { generic: 'Formoterol',         brand: ['Foradile', 'Oxis'],         class: 'LABA' },
  { generic: 'Salmeterol',         brand: ['Serevent'],                 class: 'LABA' },
  { generic: 'Tiotropium',         brand: ['Spiriva'],                  class: 'LAMA' },
  { generic: 'Montelukast',        brand: ['Singulair', 'Lukair'],      class: 'Leukotriene antagonist' },
  { generic: 'Prednisolone',       brand: ['Panafcort', 'Solone'],      class: 'Oral corticosteroid' },

  /* ============== MENTAL HEALTH ============== */
  { generic: 'Sertraline',         brand: ['Zoloft', 'Eleva'],          class: 'SSRI' },
  { generic: 'Escitalopram',       brand: ['Lexapro', 'Esipram'],       class: 'SSRI' },
  { generic: 'Fluoxetine',         brand: ['Prozac', 'Lovan'],          class: 'SSRI' },
  { generic: 'Citalopram',         brand: ['Cipramil', 'Talam'],        class: 'SSRI' },
  { generic: 'Venlafaxine',        brand: ['Efexor'],                   class: 'SNRI' },
  { generic: 'Duloxetine',         brand: ['Cymbalta', 'Andepra'],      class: 'SNRI' },
  { generic: 'Mirtazapine',        brand: ['Avanza', 'Mirtanza'],       class: 'NaSSA antidepressant' },
  { generic: 'Olanzapine',         brand: ['Zyprexa'],                  class: 'Atypical antipsychotic' },
  { generic: 'Quetiapine',         brand: ['Seroquel'],                 class: 'Atypical antipsychotic' },
  { generic: 'Risperidone',        brand: ['Risperdal'],                class: 'Atypical antipsychotic' },
  { generic: 'Aripiprazole',       brand: ['Abilify'],                  class: 'Atypical antipsychotic' },
  { generic: 'Lithium',            brand: ['Lithicarb', 'Quilonum'],    class: 'Mood stabiliser' },
  { generic: 'Sodium valproate',   brand: ['Epilim', 'Valpro'],         class: 'Mood stabiliser / anticonvulsant' },
  { generic: 'Lamotrigine',        brand: ['Lamictal'],                 class: 'Mood stabiliser / anticonvulsant' },
  { generic: 'Diazepam',           brand: ['Valium', 'Antenex'],        class: 'Benzodiazepine' },
  { generic: 'Temazepam',          brand: ['Normison'],                 class: 'Benzodiazepine' },
  { generic: 'Alprazolam',         brand: ['Xanax', 'Kalma'],           class: 'Benzodiazepine' },

  /* ============== PAIN & ANTI-INFLAMMATORY ============== */
  { generic: 'Ibuprofen',          brand: ['Nurofen', 'Brufen'],        class: 'NSAID' },
  { generic: 'Naproxen',           brand: ['Naprosyn', 'Anaprox'],      class: 'NSAID' },
  { generic: 'Celecoxib',          brand: ['Celebrex'],                 class: 'COX-2 inhibitor' },
  { generic: 'Codeine',            brand: ['Panadeine Forte', 'Codapane'], class: 'Opioid (mild)' },
  { generic: 'Tramadol',           brand: ['Tramal', 'Zydol'],          class: 'Opioid' },
  { generic: 'Oxycodone',          brand: ['Endone', 'OxyContin', 'Targin', 'OxyNorm'], class: 'Opioid' },
  { generic: 'Tapentadol',         brand: ['Palexia'],                  class: 'Opioid' },
  { generic: 'Buprenorphine',      brand: ['Norspan', 'Subutex'],       class: 'Opioid partial agonist' },
  { generic: 'Gabapentin',         brand: ['Neurontin'],                class: 'Anticonvulsant / neuropathic pain' },
  { generic: 'Pregabalin',         brand: ['Lyrica'],                   class: 'Anticonvulsant / neuropathic pain' },
  { generic: 'Amitriptyline',      brand: ['Endep'],                    class: 'TCA' },

  /* ============== GI ============== */
  { generic: 'Omeprazole',         brand: ['Losec', 'Acimax'],          class: 'PPI' },
  { generic: 'Pantoprazole',       brand: ['Somac', 'Pantoloc'],        class: 'PPI' },
  { generic: 'Esomeprazole',       brand: ['Nexium'],                   class: 'PPI' },
  { generic: 'Ranitidine',         brand: ['Zantac'],                   class: 'H2 antagonist' },

  /* ============== ENDOCRINE ============== */
  { generic: 'Levothyroxine',      brand: ['Eutroxsig', 'Oroxine'],     class: 'Thyroid hormone' },
  { generic: 'Carbimazole',        brand: ['Neo-Mercazole'],            class: 'Antithyroid' },

  /* ============== ANTICONVULSANTS ============== */
  { generic: 'Levetiracetam',      brand: ['Keppra'],                   class: 'Anticonvulsant' },
  { generic: 'Carbamazepine',      brand: ['Tegretol'],                 class: 'Anticonvulsant' },
  { generic: 'Phenytoin',          brand: ['Dilantin'],                 class: 'Anticonvulsant' },
  { generic: 'Topiramate',         brand: ['Topamax'],                  class: 'Anticonvulsant' },

  /* ============== ANTIBIOTICS (common chronic / outpatient) ============== */
  { generic: 'Amoxicillin',        brand: ['Amoxil'],                   class: 'Penicillin' },
  { generic: 'Amoxicillin/clavulanate', brand: ['Augmentin Duo'],       class: 'Penicillin + β-lactamase inhibitor' },
  { generic: 'Doxycycline',        brand: ['Vibramycin', 'Doxylin'],    class: 'Tetracycline' },
  { generic: 'Cephalexin',         brand: ['Keflex', 'Ibilex'],         class: 'Cephalosporin' },
  { generic: 'Trimethoprim',       brand: ['Alprim'],                   class: 'Folate antagonist' },
  { generic: 'Ciprofloxacin',      brand: ['Ciproxin'],                 class: 'Fluoroquinolone' },
  { generic: 'Roxithromycin',      brand: ['Rulide'],                   class: 'Macrolide' },

  /* ============== OTHER ============== */
  { generic: 'Methotrexate',       brand: ['Methoblastin'],             class: 'DMARD' },
  { generic: 'Hydroxychloroquine', brand: ['Plaquenil'],                class: 'DMARD' },
  { generic: 'Allopurinol',        brand: ['Zyloprim', 'Progout'],      class: 'Xanthine oxidase inhibitor' },
  { generic: 'Colchicine',         brand: ['Colgout', 'Lengout'],       class: 'Anti-gout' },
  { generic: 'Alendronate',        brand: ['Fosamax'],                  class: 'Bisphosphonate' },
  { generic: 'Denosumab',          brand: ['Prolia', 'Xgeva'],          class: 'Monoclonal antibody (bone)' },
  { generic: 'Tamsulosin',         brand: ['Flomaxtra'],                class: 'α-blocker (BPH)' },
  { generic: 'Sildenafil',         brand: ['Viagra'],                   class: 'PDE-5 inhibitor' },
  { generic: 'Donepezil',          brand: ['Aricept'],                  class: 'AChE inhibitor (dementia)' },
  { generic: 'Memantine',          brand: ['Ebixa'],                    class: 'NMDA antagonist (dementia)' },
  { generic: 'Levodopa/carbidopa', brand: ['Sinemet', 'Madopar'],       class: 'Antiparkinsonian' },
];

window.VACIS_MEDS_DATE = '2026-05-11';
window.VACIS_MEDS_COUNT = window.VACIS_MEDS.length;
