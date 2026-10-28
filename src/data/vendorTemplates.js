/**
 * vendorTemplates.js
 * Comprehensive vendor checklists, recommended questions to ask, and red flags per category and event type.
 * Acts as the deterministic offline fallback for the vendor_pack AI task.
 */

export const VENDOR_TEMPLATES = {
  wedding: [
    {
      id: 'venue',
      category: 'Venue',
      tasks: [
        { id: 'v1', text: 'Confirm occupancy capacity and air conditioning backup', done: false },
        { id: 'v2', text: 'Review policy on outside caterers and decor vendors', done: false },
        { id: 'v3', text: 'Inspect bride/groom green rooms and washroom hygiene', done: false },
        { id: 'v4', text: 'Clarify curfew timing for music and loud speakers (10 PM norms)', done: false },
        { id: 'v5', text: 'Lock advance payment terms and cancellation refund rules', done: false },
      ],
      questions: [
        'Is there a separate power backup generator for lighting and AC during power trips?',
        'Are there any mandatory in-house vendor royalty charges if we hire our own decorator?',
        'How many complimentary parking slots and valet drivers are included?',
        'What is the cutoff time for sound in outdoor lawn vs indoor halls?',
      ],
      redFlags: [
        'No written contract specifying exclusive venue access during your booked hours.',
        'Vague response regarding generator diesel charges or hidden cleaning fees.',
        'Refusal to allow tasting of in-house kitchen food prior to advance deposit.',
      ],
    },
    {
      id: 'catering',
      category: 'Catering',
      tasks: [
        { id: 'c1', text: 'Schedule food tasting session with chef for key mains and chaat', done: false },
        { id: 'c2', text: 'Specify live counter requirements (pani puri, dosa, pasta, kulfi)', done: false },
        { id: 'c3', text: 'Confirm waitstaff ratio (minimum 1 server per 15-20 guests)', done: false },
        { id: 'c4', text: 'Agree on leftover food packing protocol and hygienic disposal', done: false },
        { id: 'c5', text: 'Finalize branded bottled water and beverage station setup', done: false },
      ],
      questions: [
        'How do you manage continuous live counter replenishments during peak buffet rush?',
        'Is mineral water for cooking and ice cubes included in the per-plate quotation?',
        'What is the surcharge if the final guest count exceeds by 10% on event day?',
        'Are uniforms and professional hygiene kits provided for all service staff?',
      ],
      redFlags: [
        'Unwillingness to provide ingredient origin proof (e.g., pure desi ghee vs vanaspati).',
        'Overly cheap per-plate quote that later incurs extra charges for crockery and cutlery.',
        'No dedicated banquet supervisor on the floor during service.',
      ],
    },
    {
      id: 'decor',
      category: 'Decor & Lighting',
      tasks: [
        { id: 'd1', text: 'Agree on mandap structure design and floral density standards', done: false },
        { id: 'd2', text: 'Check mockups for entrance arch and stage photobooth', done: false },
        { id: 'd3', text: 'Confirm ambient fairy lights and warm spotlighting coverage', done: false },
        { id: 'd4', text: 'Verify fireproof certification for drapery and candle accents', done: false },
      ],
      questions: [
        'Are flowers fresh morning cuts or reusable artificial silk hybrids?',
        'What time will the team begin setup on the morning of the ceremony?',
        'Do you provide 3D renders or previous real setup photos for this exact hall?',
      ],
      redFlags: [
        'Reusing wilted flower arrangements from an afternoon function for evening events.',
        'Unclear breakdown between truss/lighting rental and floral material costs.',
      ],
    },
    {
      id: 'photo',
      category: 'Photo & Video',
      tasks: [
        { id: 'p1', text: 'Review full unedited portfolio of candid wedding ceremonies', done: false },
        { id: 'p2', text: 'Confirm team size: candid, traditional, drone and cinematic leads', done: false },
        { id: 'p3', text: 'Specify deliverables: 30-min film, 3-min teaser, raw footage, hard drive', done: false },
        { id: 'p4', text: 'Set firm delivery deadline for album prints (e.g. 60 days)', done: false },
      ],
      questions: [
        'Will the primary lead photographer attend personally or send associate freelancers?',
        'What is your protocol if a primary camera or memory card fails during pheras?',
        'Are drone permissions and venue clearance charges included in the quote?',
      ],
      redFlags: [
        'Contract missing explicit delivery timelines for the teaser and edited albums.',
        'Refusal to provide high-resolution uncompressed raw photo backups.',
      ],
    },
    {
      id: 'attire',
      category: 'Attire & Jewellery',
      tasks: [
        { id: 'a1', text: 'Finalize bridal lehenga and groom sherwani order with trial dates', done: false },
        { id: 'a2', text: 'Schedule final alteration fitting 10 days before wedding', done: false },
        { id: 'a3', text: 'Coordinate color themes with immediate family outfits', done: false },
        { id: 'a4', text: 'Arrange jewellery safety lockers and insurance receipt verification', done: false },
      ],
      questions: [
        'How many complimentary alteration rounds are included with the boutique?',
        'What is the lead time for matching turbans (safas) and stoles for baraatis?',
      ],
      redFlags: [
        'Delivery promised less than 5 days before the first function with no trial cushion.',
      ],
    },
    {
      id: 'makeup',
      category: 'Makeup & Mehendi',
      tasks: [
        { id: 'm1', text: 'Book bridal makeup trial with HD/Airbrush preview', done: false },
        { id: 'm2', text: 'Confirm assistant count for mother and bridesmaids styling', done: false },
        { id: 'm3', text: 'Test organic mehendi stain quality to ensure dark natural color', done: false },
        { id: 'm4', text: 'Finalize call-sheet arrival time matching photographer schedule', done: false },
      ],
      questions: [
        'Are premium eyelashes, hair extensions, and draping included in the package?',
        'What cosmetic brands (e.g. MAC, Huda Beauty) are exclusively used?',
      ],
      redFlags: [
        'Artist demanding 100% upfront payment before the wedding morning.',
        'Chemical-laced black henna that risks allergic reactions or skin burns.',
      ],
    },
    {
      id: 'entertainment',
      category: 'Music & Entertainment',
      tasks: [
        { id: 'e1', text: 'Curate sangeet playlist and soundcheck schedule', done: false },
        { id: 'e2', text: 'Confirm DJ sound console, subwoofer, and cordless mic count', done: false },
        { id: 'e3', text: 'Book traditional dhol players for baraat procession', done: false },
      ],
      questions: [
        'Do you manage the IPRS/PPL music license compliance for commercial tracks?',
        'Can you provide a live sound engineer dedicated to acoustic mic balancing?',
      ],
      redFlags: [
        'Inadequate sound gear that causes audio feedback or screeching during vows.',
      ],
    },
  ],
  birthday: [
    {
      id: 'venue',
      category: 'Venue',
      tasks: [
        { id: 'bv1', text: 'Verify child-safe boundaries, carpet flooring, and clean restroom access', done: false },
        { id: 'bv2', text: 'Confirm dedicated cake cutting table and backdrop setup wall', done: false },
        { id: 'bv3', text: 'Check party duration extension charges by the hour', done: false },
      ],
      questions: [
        'Is outside balloon decoration and cartoon cutout pasting permitted on walls?',
        'Is there a designated quiet area for toddlers and infant feeding?',
      ],
      redFlags: [
        'Venue with slippery tiled floors near game zones without safety mats.',
      ],
    },
    {
      id: 'cake',
      category: 'Cake',
      tasks: [
        { id: 'bc1', text: 'Finalize theme cake design, flavor (e.g. Belgian chocolate), and weight', done: false },
        { id: 'bc2', text: 'Confirm eggless or nut-free allergen requirements for school guests', done: false },
        { id: 'bc3', text: 'Schedule temperature-controlled delivery 1 hour before party start', done: false },
      ],
      questions: [
        'Is the delivery handled in an air-conditioned vehicle to prevent tier melting?',
        'Can you provide edible fondant figurines rather than toxic plastic toppers?',
      ],
      redFlags: [
        'Bakers who ask you to pick up multi-tiered cakes yourself in private cars.',
      ],
    },
    {
      id: 'entertainment',
      category: 'Entertainment',
      tasks: [
        { id: 'be1', text: 'Book engaging host/emcee for children party games and music', done: false },
        { id: 'be2', text: 'Arrange magic show, puppet show, or tattoo/face painting artist', done: false },
        { id: 'be3', text: 'Prepare musical chairs music tracks and prize token distribution', done: false },
      ],
      questions: [
        'Are your paints FDA-approved non-toxic and skin-safe for sensitive children?',
        'What age group are your magic tricks and interactive games calibrated for?',
      ],
      redFlags: [
        'Entertainers who show up late without their own sound system or props.',
      ],
    },
  ],
  community: [
    {
      id: 'venue',
      category: 'Venue & Permissions',
      tasks: [
        { id: 'cv1', text: 'Obtain RWA executive committee and municipal police NOC', done: false },
        { id: 'cv2', text: 'Verify fire safety clearance and emergency vehicle access routes', done: false },
        { id: 'cv3', text: 'Arrange backup silent diesel generator for stage and street lighting', done: false },
      ],
      questions: [
        'What is the maximum decibel sound cutoff level permitted by local authorities?',
        'Is temporary commercial power metering required for high-wattage halogen lights?',
      ],
      redFlags: [
        'Operating sound gear after 10 PM without written local police clearance.',
      ],
    },
    {
      id: 'stage',
      category: 'Stage Sound & Lights',
      tasks: [
        { id: 'cs1', text: 'Inspect stage truss stability and wind-resistant backdrop anchoring', done: false },
        { id: 'cs2', text: 'Verify minimum 6 cordless microphones and monitor speakers for performers', done: false },
        { id: 'cs3', text: 'Appoint dedicated sound engineer for opening ceremonies and announcements', done: false },
      ],
      questions: [
        'How will cables across pedestrian walkways be covered to prevent tripping hazards?',
        'What rain protection covers are provided for the audio mixing console and amplifiers?',
      ],
      redFlags: [
        'Exposed electrical wire joints near water stations or crowded seating aisles.',
      ],
    },
  ],
};

/**
 * Get vendor checklist cards for a given event type
 * @param {'wedding'|'birthday'|'community'} eventType
 * @returns {Array<object>}
 */
export function getVendorTemplates(eventType = 'wedding') {
  const list = VENDOR_TEMPLATES[eventType] || VENDOR_TEMPLATES.wedding;
  return list.map(item => ({
    id: item.id,
    category: item.category,
    status: 'not_started',
    tasks: item.tasks.map(t => ({ ...t })),
    questions: [...item.questions],
    redFlags: [...item.redFlags],
    notes: '',
    source: 'template',
  }));
}
