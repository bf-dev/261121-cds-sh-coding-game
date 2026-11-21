# Professor floor and function proposals

**Proposal (Aretha and ChatGPT, 2026-11-21).** One challenger per CDS1 floor. This is a design draft, not a statement that a professor works on that floor or has agreed to appear. Alan Dougherty and Shengzhi Qin (Brian) are lecturers; use their correct titles. Confirm each person's participation and likeness before adding named avatars. The current game still uses fictional professors (see [design choices](../game/DESIGN-CHOICES.md)).

The visitor is a student being challenged by teachers, not fighting villains. Each professor demonstrates one new computing idea as a defence block. After the player wins, they acquire that block. The player builds ATTACK or HEAL by clicking number and operator blocks; defensive functions only affect an incoming ATTACK. Show the effect in ordinary words and an animation, with the Python/C++ equivalent behind an optional button. See [decisions](decisions.md), [CS logic](cards-cs-logic.md), and [CDS1 reference](../buildings/cds1/README.md).

## Floor lineup

| Floor and campus setting | Challenger (proposed) | New defence block awarded after the battle | One visible example / visitor lesson |
| --- | --- | --- | --- |
| **1/F — lobby and lecture theatre** | [Dr. Alan Dougherty](https://www.cs.hku.hk/people/academic-staff/dougherty/) · computer vision | **`round()` — Round Off** | Halve damage and round to a whole number: 7 / 2 = 3.5 → 4. The tutorial shows the rounding step. |
| **2/F — lecture theatre and student lounge** | [Dr. Shengzhi Qin (Brian)](https://www.cs.hku.hk/people/academic-staff/szqin/) · cybersecurity | **`if` — Security Check** | If damage > 5, block 4. The gate lights up true or false. |
| **3/F — teaching and learning lab** | [Prof. Zhiyi Huang](https://www.cs.hku.hk/people/academic-staff/zhiyi) · algorithms | **`min()` — Damage Cap** | `min(9, 5) = 5`: a 9-point hit becomes 5. Choose a good attack after seeing the cap. |
| **4/F — adapted teaching layout** | [Prof. Jia Pan](https://www.cs.hku.hk/programmes/course-offered/?infile=2025%2Fcomp3356.html) · robotics | **`while` — Robot Guard** | Block 1 repeatedly while shield energy remains; a robot spends one energy per step. |
| **5/F — adapted teaching layout** | [Prof. Taku Komura](https://www.ai.hku.hk/people/academic-staff/taku) · animation | **`abs()` — Motion Gap** | Choose two digits; `abs(6 - 2) = 4` blocks 4. Show a character moving four spaces. |
| **6/F — teamwork space and classrooms** | [Prof. Chenshu Wu](https://www.cs.hku.hk/people/academic-staff/chenshu) · sensing | **`any()` — Sensor Alert** | If any digit in the incoming move reaches the marked threshold, block 4. Light the matching sensor. |
| **7/F — teaching and learning lab** | [Prof. Reynold Cheng](https://ai.hku.hk/people/academic-staff/ckcheng) · uncertain data | **`random.randint()` — Uncertain Shield** | Roll 0 to 6 and block the result, never more than the incoming hit. Display all possible outcomes first. |
| **8/F — adapted teaching layout** | [Prof. Chuan Wu](https://www.cs.hku.hk/people/academic-staff/cwu/) · networks | **`sum()` — Network Buffer** | Add small buffer values: `sum([1, 2, 2]) = 5`, so block 5. |
| **9/F — research lab** | [Prof. Heming Cui](https://www.cs.hku.hk/people/academic-staff/heming/) · parallel systems | **`max()` — Best Worker** | Two workers offer 2 or 5 defence; `max(2, 5) = 5` chooses the stronger. |
| **10/F — research lab** | [Prof. Lequan Yu](https://ai.hku.hk/people/academic-staff/yulequan) · medical image analysis | **`all()` — Diagnosis Check** | A stronger shield activates only if all digits in the incoming move satisfy a visible condition. Contrast with `any()`. |
| **11/F — professor offices** | [Prof. Siu Ming Yiu](https://www.cs.hku.hk/people/academic-staff/smyiu/) · security | **`mod()` — Mod Shield** | Group 8 damage tokens in threes: `mod(8, 3) = 2`, so 2 gets through. The game block is MOD; Python can show `operator.mod(8, 3)` or `8 % 3`. |
| **12/F — adapted research layout** | [Prof. Ruibang Luo](https://bio8.cs.hku.hk/) · bioinformatics | **`len()` — Sequence Length** | Count the digit blocks in the incoming expression; three digits give a 3-point shield. |
| **13/F — professor office lounge** | [Prof. Tak-Wah Lam](https://www.cs.hku.hk/index.php/people/academic-staff/twlam) · algorithms and health data | **`sorted()` — Order the Options** | Sort three shield values and select the middle: [6, 2, 4] → [2, 4, 6] → 4. *Experimental: selecting the middle is a game rule, not what `sorted()` itself does.* |
| **14/F — director and exhibition lounge** | [Prof. Yi Ma](https://ai.hku.hk/people/academic-staff/mayi) · computer vision and AI | **`filter()` — Pattern Filter** | Highlight one qualifying part of the incoming expression and remove it before damage resolves. *Experimental: define exact behaviour with ×, ÷, and brackets before building.* |

The 1/F, 6/F, 13/F and 14/F spaces have filmed references. Other floors use the lift directory's functions and adapted layouts; do not imply that a proposed boss's real office is there. After 14/F, the player visits the Grand Hall to challenge Leo, as in [progression and story](progression-and-story.md).

## Unlock and battle presentation

1. The professor assembles their special shield from visible blocks and digits. The player sees where its values came from.
2. A two-second preview demonstrates what the shield does to a sample hit. The professor's actual shield can still follow the battle's face-down reveal rule.
3. On victory, a pop-up awards the new block and shows one worked example. The next encounter invites the player to use it.
4. New blocks join the available collection, but only a small selection appears in a defence hand each turn. Keep the interface readable for non-coders under the 30-second turn clock.
5. Reuse campus details during exploration: the 6/F circular teamwork seating, 13/F red lift numeral and green booths, and the 14/F HKU history exhibition.

## Design checks before implementation

- The repo currently gives `if >` on floor 1 and other function upgrades on selected floors. This proposal changes that progression; update code and [design choices](../game/DESIGN-CHOICES.md) together if accepted.
- Confirm whether every floor awards a function, and how many owned blocks may be equipped or drawn. Fourteen options in one hand would overwhelm a new visitor.
- Define caps and costs for `min()`, `mod()` and random defence against later floors' larger HP and damage values. An unrestricted `mod(damage, 9)` can erase nearly any hit.
- Resolve the 13/F and 14/F experimental effects before shipping. Their optional code examples must describe what the game actually computes.
- Ask each person before using their name, likeness, voice or research theme in the published game. Fictional placeholders can stay in the playable build until then.
