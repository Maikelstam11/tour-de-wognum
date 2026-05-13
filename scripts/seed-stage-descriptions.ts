import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

const { stages } = schema;
const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const stageData: Array<{
  stageNumber: number;
  country: string;
  description: string;
  expectedScenario: string;
}> = [
  {
    stageNumber: 1,
    country: `Spanje`,
    description: `De Tour opent met een ploegentijdrit van 19,7 kilometer in Barcelona. Na een vlakke openingsfase langs de kust en door de stadskern is de finale heuvelachtig op de Montjuic. Anders dan bij een klassieke ploegentijdrit wordt voor iedere renner zijn individuele tijd opgenomen. De slotkilometers voeren over de Plaza de Espana omhoog naar de stadsberg, waarbij de laatste 800 meter 7% stijgt.`,
    expectedScenario: `Goede klimmers kunnen in de slotklim overwegen hun ploeggenoten achter te laten om een snellere individuele tijd neer te zetten. Tijdritspecialisten en klimbers maken kans op de dagzege. Snel en explosief.`,
  },
  {
    stageNumber: 2,
    country: `Spanje`,
    description: `De tweede etappe voert in 178 kilometer van Tarragona terug naar Barcelona, via 2.400 hoogtemeters. De eerste helft is vlak langs de Costa Dorada, maar na 85 kilometer gaat het landinwaarts. Het afsluitende circuit over de Montjuic kent twee kuitenbijters: de Cote du chateau de Montjuic (1,6 km a 9,3%) en de Cote du Stade Olympique (600 m a 7%). Die laatste helling wordt drie keer aangedaan, met de finish bovenop na de laatste passage.`,
    expectedScenario: `Een punchy finale op de Montjuic: vluchters en aanvallers uit de kopgroep maken de meeste kans. Klassementsrenners zullen elkaars bewegingen bewaken. Een selecte groep sprint om de zege bovenop de klim.`,
  },
  {
    stageNumber: 3,
    country: `Spanje / Frankrijk`,
    description: `De derde etappe trekt vanuit Granollers de Pyreneen over, net over de grens met Frans grondgebied als finish in Les Angles. Met bijna 4.000 hoogtemeters is het een flinke kluif. Na een vlak begin volgen in de tweede helft de Collada de Toses (9,3 km a 6,5%) en Col du Calvaire (14,9 km a 4,1%). De slotklim in het skigebied Les Angles is 4,7 kilometer lang, met de laatste 1,7 kilometer a 7,6%.`,
    expectedScenario: `De klimmers bepalen de koers. Na een lange reisdag in de Pyreneen verwacht een beslissende aanval op de slotklim naar Les Angles. Vluchters maken kans als het peloton te lang wacht.`,
  },
  {
    stageNumber: 4,
    country: `Frankrijk`,
    description: `De vierde etappe doorploegt de uitlopers van de Pyreneen van Carcassonne naar Foix, goed voor zo'n 2.800 hoogtemeters. Halverwege is de Col de Coudins de zwaarste klim (10,5 km a 5,5%), gevolgd door de Col de Montsegur (6,9 km a 6,9%) met de top op 35,5 km van de streep. De finale loopt via Foix vals plat omlaag, wat vluchters of baroudeurs extra kansen biedt.`,
    expectedScenario: `Foix staat bekend als aanvallerswalhalla. Een vroege vlucht met doeners heeft goede kansen als het peloton de achtervolging te laat inzet. Een klassieke Pyreneen-aankomst voor de avonturiers.`,
  },
  {
    stageNumber: 5,
    country: `Frankrijk`,
    description: `De vijfde etappe is 158 kilometer van Lannemezan naar Pau, via de vlakke wegen langs de Pyreneen. Er zijn slechts drie kleine klimmetjes op 26 km van de finish: Cote de Casteide-Doat (1,5 km a 5,1%), Cote de Flancart (1 km a 6,4%) en Cote de Baleix (1,3 km a 7%). Daarna is het 26 kilometer overwegend vlak naar de bekende sprintstad Pau.`,
    expectedScenario: `Een massasprint in Pau lijkt zeker. Het is de 64e keer dat de Tour er finisht. Jasper Philipsen won hier twee jaar geleden, voor Van Aert en Ackermann. De snelle mannen zijn aan zet.`,
  },
  {
    stageNumber: 6,
    country: `Frankrijk`,
    description: `De zesde etappe is de finale in de Pyreneen: 186 kilometer van Pau via de Col d'Aspin (12 km a 6,5%) en Col du Tourmalet (17 km a 7,3%) naar de nooit eerder bezochte finish nabij het betoverende Cirque de Gavarnie. Na de afdaling van de Tourmalet fietsen de renners 18,7 kilometer tegen gemiddeld 3,7% naar Gavarnie-Gedre, met 4.150 hoogtemeters totaal.`,
    expectedScenario: `De Tourmalet wordt de slijpsteen. Wie er over de top met een groepje voorop zit, heeft het beste uitzicht op de etappezege. De slotklim is lang maar niet bijzonder steil, een groepssprint in Gavarnie is mogelijk.`,
  },
  {
    stageNumber: 7,
    country: `Frankrijk`,
    description: `Van Hagetmau naar Bordeaux: 175 kilometer door de Landes, overwegend vlak. Er is maar een obstakel, de Cote de Beguey (1,6 km a 4,2%) op 40 kilometer van de streep. Bordeaux is een klassieke sprintstad: 133 keer al finishte de Tour er. De wijnstad verwelkomt renners als Philipsen, Pedersen, Merlier en Milan in een razendsnel peloton.`,
    expectedScenario: `Een massasprint in Bordeaux is zo goed als zeker. De sprinttrein wint het waarschijnlijk, met Philipsen, Pedersen of Merlier als topfavoriet voor de dagzege.`,
  },
  {
    stageNumber: 8,
    country: `Frankrijk`,
    description: `Perigueux naar Bergerac: 182 kilometer met nauwelijks obstakels door de Perigord. De route volgt een tijd lang de Vezere, daarna het dal van de Dordogne naar Bergerac. Het profiel is nagenoeg vlak. Sprinters die in Bordeaux naast de zege grepen, krijgen hier een kans op revanche.`,
    expectedScenario: `Een tweede kans voor de sprinters na de etappe naar Bordeaux. Marcel Kittel won hier in 2017. Met dit vlakke parcours mag je opnieuw een massasprint verwachten.`,
  },
  {
    stageNumber: 9,
    country: `Frankrijk`,
    description: `De laatste etappe voor de eerste rustdag voert 185 kilometer van Malemort naar Ussel, door een golvend Massif Central-landschap met zo'n 3.500 hoogtemeters. Hoogtepunten zijn de Suc au May (4 km a 7,7%), Cote de la Croix de Pey (7 km a 4,9%) en Mont Bessou (800 m a 8,5%) op 24 km van de finish. Geen echte col, maar een non-stop paternoster van taaie heuvels.`,
    expectedScenario: `Te zwaar voor de pure sprinters, te licht voor de grote favorieten. Een kans voor punchers, allrounders en vluchters met klimmersbenen. Wie de energie spaart, kan in de finale toeslaan.`,
  },
  {
    stageNumber: 10,
    country: `Frankrijk`,
    description: `Op de Franse nationale feestdag: 167 kilometer van Aurillac door het Centraal Massief naar Le Lioran, met 3.900 hoogtemeters. Zwaarste klim is de Puy Mary/Pas de Peyrol (7,8 km a 6%, laatste 2,2 km a 8,8%), gevolgd door de Col de Pertus (4,4 km a 8,5%). Het was het decor van Vingegaard die Pogacar klopte in 2024. De finish in Le Lioran steekt omhoog met 6% in de laatste honderden meters.`,
    expectedScenario: `De klassementsmannen laten van zich horen op de Puy Mary en Col de Pertus. Een titanenstrijd verwacht: deze aankomst heeft bewezen het GC te kunnen omgooien. Aanvallen op de laatste kilometers is de tactiek.`,
  },
  {
    stageNumber: 11,
    country: `Frankrijk`,
    description: `Een vlakke herademing: 161 kilometer van kuuroord Vichy naar Nevers, langs de rivier de Allier en door het Loire-vallei. Het enige obstakel is de Cote de Billy-Chevannes (1,5 km a 6%) op 40 km van de streep. Nevers heeft de Tour al drie keer ontvangen; altijd won er een sprinter.`,
    expectedScenario: `Een massasprint in Nevers. Na de zware rittendagen in het Massif Central hebben de sprinters zich hersteld en gaan ze vol voor de zege. Favoriet is wie het snelst is in de laatste 200 meter.`,
  },
  {
    stageNumber: 12,
    country: `Frankrijk`,
    description: `De langste vlakke rit van de week: 181 kilometer van het Formule 1-circuit van Magny-Cours naar Chalon-sur-Saone. Vrijwel het hele parcours gaat over glooiende wegen langs de Loire en Saone. De Cote de Montagny-les-Buxy (2,6 km a 3,9%) op 20 km van de finish is het enige serieuze obstakel, maar te kort om het peloton te splijten.`,
    expectedScenario: `Opnieuw een massasprint. Dylan Groenewegen won hier in 2019. Een slecht klimmende sprinter kan ter hoogte van Montagny even lossen, maar heeft 20 km om terug te keren. Snelle benen winnen.`,
  },
  {
    stageNumber: 13,
    country: `Frankrijk`,
    description: `De langste etappe van de Tour 2026: 205 kilometer van Dole door de Vogezen naar Belfort. De Ballon d'Alsace (8,7 km a 6,9%) is de de klim van de dag, een Tourlegende van 121 jaar oud. De top ligt op 30 km van de streep; daarna volgt een razende afdaling richting Belfort, met op 5 km van de finish nog een strook van 800 m a 8%.`,
    expectedScenario: `De afdaling naar Belfort maakt het een dubbeltje op zijn kant. Een baroudeur als Mohoric of een waaghals als Pidcock kan verrassen. Maar ook een gecontroleerde afdaling door klassementsmannen is mogelijk.`,
  },
  {
    stageNumber: 14,
    country: `Frankrijk`,
    description: `De veertiende etappe doorloopt de Vogezen: 155 kilometer van Mulhouse naar skigebied Le Markstein via zeven beklimmingen en 3.800 hoogtemeters. De Grand Ballon opent (21,5 km a 8,1%), gevolgd door een lus met de Ballon d'Alsace (8,7 km a 6,9%), Col du Schirm en Col du Hundsruck. Slotbeklimmingen: Geishouse (10,9 km a 7,3%) plus Col du Haag (11,2 km a 7,3%, laatste 1,6 km a 10,3%).`,
    expectedScenario: `Een zware dag in de Vogezen met twee lastige slotklimmen. Pogacar won Le Markstein in 2023. Een klimmergroep beslist de etappe. In de Col du Haag wordt het definitief uitgespeeld.`,
  },
  {
    stageNumber: 15,
    country: `Frankrijk`,
    description: `De koninginnenrit van de eerste Alpenweek: 184 kilometer van Champagnole naar het Plateau de Solaison, met 4.700 hoogtemeters. De Col de la Croisette (7,6 km a 8,8%, laatste 4,7 km a 11,2%) trekt de boel open op 50 km van de streep. De slotklim naar het Plateau de Solaison is een brute van 11,3 kilometer a gemiddeld 9,1%. Vingegaard domineerde dit plateau in het Criterium du Dauphine 2022.`,
    expectedScenario: `Dit is de dag voor de pure klimmers. De Croisette maakt de selectie, Solaison beslist de Tour. Pogacar en Vingegaard gaan hier alles op alles zetten. Verwacht een zware finale met grote tijdsverschillen.`,
  },
  {
    stageNumber: 16,
    country: `Frankrijk`,
    description: `De slotweek opent met een individuele tijdrit van 26 kilometer langs het Meer van Geneve, van Evian-les-Bains naar Thonon-les-Bains. Vanuit de start klimt de weg in 9,6 km a 4,2% naar zo'n 800 meter hoogte, daalt dan 7 km terug naar het meer, waarna het 9 km vlak is naar de finish. Totaal zo'n 500 hoogtemeters.`,
    expectedScenario: `Elke seconde telt in deze beslissende tijdrit. Met een heuvelachtig profiel profiteren klimmende tijdrijders. Het GC kan hier drastisch wijzigen. Pogacar en Vingegaard gaan strijden voor kostbare seconden.`,
  },
  {
    stageNumber: 17,
    country: `Frankrijk`,
    description: `Een etappe die de Tour "vlak" noemt maar 2.400 hoogtemeters herbergt: 175 kilometer van Chambery naar Voiron door het Bauges-massief en de Chartreuse. De Col des Pres (3,5 km a 6,6%) en Col de Couz (8,6 km a 2,8%) zijn de voornaamste heuvels. In de laatste 35 km gaat het hoofdzakelijk naar beneden, met op 6 km van de meet nog een heuvel van 2,5 km a 3,5%.`,
    expectedScenario: `Ondanks de hoogtemeters verwachten de sprinters dat zij het voor het zeggen krijgen in Voiron. Ben Turner won hier de Vuelta-etappe in augustus 2025. Voor pure sprinters kan het net iets te heuvelachtig zijn.`,
  },
  {
    stageNumber: 18,
    country: `Frankrijk`,
    description: `De Alpen in: 185 kilometer van Voiron naar Orcieres-Merlette met 3.800 hoogtemeters. Na de klim naar Engins (11,4 km a 5,4%) en Monteynard (9,7 km a 5%) rijden de renners 55 kilometer op hoogte. De slotklim naar het skigebied is gelijkmatig: 7,1 kilometer a 6,7%. Roglic klopte Pogacar hier in 2020 in een groepssprint.`,
    expectedScenario: `De gelijkmatige slotklim nodigt uit tot een groepssprint van de overgebleven klimmers. Maar met nog drie etappes te gaan zullen klassementsmannen hun kruit droog houden of net versnellen.`,
  },
  {
    stageNumber: 19,
    country: `Frankrijk`,
    description: `De befaamde berg wacht: 128 kilometer van Gap naar Alpe d'Huez via vier cols. Vanuit de start de Col Bayard (5,1 km a 7,2%), dan de Col du Noyer (7,2 km a 8,5%), een rustiger middenstuk, de Col d'Ornon (5,4 km a 6,4%) en ten slotte de Alpe d'Huez met zijn 21 haarspeldbochten in 13,8 kilometer a 8,1%. Tom Pidcock won hier solo in 2022.`,
    expectedScenario: `Alpe d'Huez is het grootste podium van de Tour. Een vroege aanval al op de Col du Noyer is mogelijk. De 21 bochten bieden spectaculaire televisiebeelden en de mogelijkheid van een solo. Klimmers gaan hier alles riskeren.`,
  },
  {
    stageNumber: 20,
    country: `Frankrijk`,
    description: `De koninginnenrit: 171 kilometer van Bourg d'Oissans naar Alpe d'Huez met 5.600 hoogtemeters via Col de la Croix de Fer (24 km a 5,2%), Col du Telegraphe (11,9 km a 7,1%), Col du Galibier (17,7 km a 6,9%, top op 2.642 m) en Col de Sarenne (12,8 km a 7,3%). De finish is weer op Alpe d'Huez, bereikt via een afdaling en slotklim van 3,7 km a 6,2%.`,
    expectedScenario: `De zwaarste dag van de Tour. Het Galibier is het dak van de wedstrijd; hier kan alles gekanteld worden. Een aanval op de Sarenne of de afdaling naar de Alpe is mogelijk. Episch gevecht tussen de besten verwacht.`,
  },
  {
    stageNumber: 21,
    country: `Frankrijk`,
    description: `De slotetappe van 130 kilometer begint in Thoiry en eindigt op de Champs-Elysees in Parijs. Net als vorig jaar staat de kasseiklim Cote de la Butte Montmartre (1,1 km a 5,9%) driemaal op het menu, voor het laatst op 6,1 kilometer van de streep. Daarna volgen drie rondjes van 6,8 km over de Champs-Elysees. Wout van Aert soleerde hier vorig jaar naar een legendarische overwinning.`,
    expectedScenario: `Montmartre maakt de slotetappe onvoorspelbaar. Aanvallers die de kasseiklim drie keer aanvuren, kunnen een sprint voorkomen. Maar ook een massasprint op de Champs-Elysees is mogelijk als niemand durft aan te vallen.`,
  },
];

async function main() {
  console.log(`Updating ${stageData.length} stages...`);
  for (const s of stageData) {
    await db
      .update(stages)
      .set({
        description: s.description,
        expectedScenario: s.expectedScenario,
        country: s.country,
      })
      .where(eq(stages.stageNumber, s.stageNumber));
    console.log(`  OK Etappe ${s.stageNumber}`);
  }
  console.log('Klaar!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
