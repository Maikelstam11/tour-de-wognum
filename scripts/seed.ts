import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

// ─── TEAMS ────────────────────────────────────────────────────────────────────
const TEAMS = [
  { name: 'Visma | Lease a Bike', country: 'Nederland', primaryColor: '#FFD700', secondaryColor: '#000000', description: 'De Nederlandse topploeg met Jonas Vingegaard als kopman voor het algemeen klassement.' },
  { name: 'UAE Team Emirates', country: 'VAE', primaryColor: '#FF0000', secondaryColor: '#FFFFFF', description: 'Het team van Tadej Pogačar, de dominante Sloveense kampioen.' },
  { name: 'Red Bull – BORA – hansgrohe', country: 'Duitsland', primaryColor: '#CC0000', secondaryColor: '#1a1a1a', description: 'Ambitieus team met Remco Evenepoel en Florian Lipowitz als kopmannen.' },
  { name: 'INEOS Grenadiers', country: 'Groot-Brittannië', primaryColor: '#0055A4', secondaryColor: '#FFFFFF', description: 'Het Britse topteam, eens de dominante kracht in de Tour de France.' },
  { name: 'Alpecin – Premier Tech', country: 'België', primaryColor: '#E2001A', secondaryColor: '#FFFFFF', description: 'Het team van Mathieu van der Poel, sterk in de klassiekers en sprints.' },
  { name: 'Lidl – Trek', country: 'VS', primaryColor: '#E2001A', secondaryColor: '#000000', description: 'Een ambitieus team met Juan Ayuso en Mads Pedersen als kopmannen.' },
  { name: 'Soudal – QuickStep', country: 'België', primaryColor: '#0066CC', secondaryColor: '#FFFFFF', description: 'De Wolfpack, beroemd om hun sprinters en klassementsrenners.' },
  { name: 'Decathlon AG2R La Mondiale', country: 'Frankrijk', primaryColor: '#009900', secondaryColor: '#FFFFFF', description: 'Het Franse team met Ben O\'Connor als GC-kopman.' },
  { name: 'Bahrain Victorious', country: 'Bahrein', primaryColor: '#CC0000', secondaryColor: '#FFCC00', description: 'Een internationaal team met ambitieuze GC-kandidaten.' },
  { name: 'EF Education – EasyPost', country: 'VS', primaryColor: '#FF69B4', secondaryColor: '#FFFFFF', description: 'Het kleurrijke roze team met Richard Carapaz.' },
  { name: 'Team Jayco – AlUla', country: 'Australië', primaryColor: '#003d7a', secondaryColor: '#FFCC00', description: 'Het Australische team met Simon Yates als GC-troef.' },
  { name: 'Movistar', country: 'Spanje', primaryColor: '#00B3E3', secondaryColor: '#009900', description: 'Het Spaanse telecomteam met Enric Mas.' },
  { name: 'Team Picnic PostNL', country: 'Nederland', primaryColor: '#FF6600', secondaryColor: '#FFFFFF', description: 'Het nieuwe Nederlandse team met Frank van den Broek als ster.' },
  { name: 'Lotto – Intermarché', country: 'België', primaryColor: '#FF0000', secondaryColor: '#000080', description: 'Belgisch team met Lennert Van Eetvelt en sprinter Arnaud De Lie.' },
  { name: 'Arkéa – B&B Hotels', country: 'Frankrijk', primaryColor: '#FF8C00', secondaryColor: '#FFFFFF', description: 'Het Franse team, sterk in ontsnappingen.' },
  { name: 'XDS Astana', country: 'Kazachstan', primaryColor: '#0066CC', secondaryColor: '#FFCC00', description: 'Het Kazachse team met internationale ambities.' },
  { name: 'Groupama – FDJ', country: 'Frankrijk', primaryColor: '#0000CC', secondaryColor: '#FFFFFF', description: 'Het French team met sprinters en klimmers.' },
  { name: 'Cofidis', country: 'Frankrijk', primaryColor: '#CC0000', secondaryColor: '#000000', description: 'Een Frans team met focus op vlakke etappes.' },
  { name: 'Tudor Pro Cycling', country: 'Zwitserland', primaryColor: '#8B0000', secondaryColor: '#FFFFFF', description: 'De ambitieuze Zwitserse wildcardploeg.' },
  { name: 'TotalEnergies', country: 'Frankrijk', primaryColor: '#FF0000', secondaryColor: '#FFCC00', description: 'Franse wildcardploeg met Peter Sagan-erfenis.' },
  { name: 'Pinarello – Q36.5', country: 'Italië', primaryColor: '#6600CC', secondaryColor: '#FFFFFF', description: 'Nieuwe Italiaanse wildcardploeg met topmateriaal.' },
  { name: 'Caja Rural – Seguros RGA', country: 'Spanje', primaryColor: '#006633', secondaryColor: '#FFFFFF', description: 'Spaanse wildcardploeg, specialist in ontsnappingen.' },
  { name: 'Intermarché Wanty', country: 'België', primaryColor: '#FF6600', secondaryColor: '#000000', description: 'Belgisch team met focus op aanvallende koers.' },
];

// ─── RIDERS ───────────────────────────────────────────────────────────────────
type Speciality = 'climber' | 'sprinter' | 'time_trialist' | 'gc_contender' | 'domestique' | 'puncheur';
const RIDERS_BY_TEAM: Record<string, Array<{ name: string; nationality: string; speciality: Speciality; bio: string }>> = {
  'Visma | Lease a Bike': [
    { name: 'Jonas Vingegaard', nationality: 'Denemarken', speciality: 'gc_contender', bio: 'Tweevoudig Tourwinnaar (2022, 2023). De grote favoriet voor het algemeen klassement.' },
    { name: 'Wout van Aert', nationality: 'België', speciality: 'puncheur', bio: 'Een van de meest complete renners ter wereld — sterk in sprint, berg én tijdrit.' },
    { name: 'Matteo Jorgenson', nationality: 'VS', speciality: 'gc_contender', bio: 'De Amerikaan die zich steeds meer laat gelden in het algemeen klassement.' },
    { name: 'Victor Campenaerts', nationality: 'België', speciality: 'time_trialist', bio: 'Uurtijdrijdkampioen en specialist in tijdritten.' },
    { name: 'Christophe Laporte', nationality: 'Frankrijk', speciality: 'sprinter', bio: 'Snelle Fransman en een van de sterkste helpers van Vingegaard.' },
    { name: 'Sepp Kuss', nationality: 'VS', speciality: 'climber', bio: 'De Amerikaanse klimgeit, onmisbaar als bergknecht.' },
    { name: 'Bruno Armirail', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Betrouwbare Franse knecht met kopmanscapaciteiten.' },
    { name: 'Tiesj Benoot', nationality: 'België', speciality: 'puncheur', bio: 'Veelzijdige Belg die goed presteert op heuvelachtig terrein.' },
  ],
  'UAE Team Emirates': [
    { name: 'Tadej Pogačar', nationality: 'Slovenia', speciality: 'gc_contender', bio: 'Drievoudig Tourwinnaar. Misschien wel de beste renner aller tijden van zijn generatie.' },
    { name: 'Adam Yates', nationality: 'Groot-Brittannië', speciality: 'climber', bio: 'Britse klimmer en betrouwbare helper voor Pogačar.' },
    { name: 'João Almeida', nationality: 'Portugal', speciality: 'gc_contender', bio: 'Portugese klimmer die uitgegroeid is tot een echte GC-renner.' },
    { name: 'Marc Hirschi', nationality: 'Zwitserland', speciality: 'puncheur', bio: 'Explosieve Zwitserse puncheur, gevaarlijk in ontsnappingen.' },
    { name: 'Nils Politt', nationality: 'Duitsland', speciality: 'domestique', bio: 'Sterke Duitser die het werk doet in het peloton.' },
    { name: 'Pavel Sivakov', nationality: 'Frankrijk', speciality: 'climber', bio: 'Klimmer met Russische roots, goed in de hoge bergen.' },
    { name: 'Tim Wellens', nationality: 'België', speciality: 'puncheur', bio: 'Belgische puncheur en ontsnappingsspecialist.' },
    { name: 'Alexey Lutsenko', nationality: 'Kazachstan', speciality: 'domestique', bio: 'Betrouwbare Kazachse helper voor het team.' },
  ],
  'Red Bull – BORA – hansgrohe': [
    { name: 'Remco Evenepoel', nationality: 'België', speciality: 'gc_contender', bio: 'Wereldkampioen en Vuelta-winnaar. Een complete renner die zijn eerste Tourwinst najaagt.' },
    { name: 'Florian Lipowitz', nationality: 'Duitsland', speciality: 'climber', bio: 'Jonge Duitse belofte die razendsnel doorgroeide naar de top.' },
    { name: 'Jai Hindley', nationality: 'Australië', speciality: 'climber', bio: 'Giro-winnaar 2022, een sluipschutter in de bergen.' },
    { name: 'Maxim Van Gils', nationality: 'België', speciality: 'puncheur', bio: 'Jonge Belg die explosief is op korte klimmen.' },
    { name: 'Daniel Felipe Martínez', nationality: 'Colombia', speciality: 'climber', bio: 'Colombiaanse klimmer met GC-ambities.' },
    { name: 'Gianni Moscon', nationality: 'Italië', speciality: 'domestique', bio: 'Italiaanse all-rounder en betrouwbare ploegrijder.' },
    { name: 'Laurence Pithie', nationality: 'Nieuw-Zeeland', speciality: 'sprinter', bio: 'Jonge Nieuw-Zeelandse sprinter met een schitterende toekomst.' },
    { name: 'Jan Tratnik', nationality: 'Slovenia', speciality: 'domestique', bio: 'Sloveense knecht en tijdritspecialist.' },
  ],
  'INEOS Grenadiers': [
    { name: 'Egan Bernal', nationality: 'Colombia', speciality: 'gc_contender', bio: 'Tourwinnaar 2019, op weg terug naar zijn beste niveau.' },
    { name: 'Thymen Arensman', nationality: 'Nederland', speciality: 'climber', bio: 'Nederlandse klimmer die steeds meer in het oog springt.' },
    { name: 'Carlos Rodríguez', nationality: 'Spanje', speciality: 'gc_contender', bio: 'Spaanse belofte met grote GC-ambities.' },
    { name: 'Tom Pidcock', nationality: 'Groot-Brittannië', speciality: 'puncheur', bio: 'Olympisch mountainbikekampioen en veelzijdig wegrenner.' },
    { name: 'Josh Tarling', nationality: 'Groot-Brittannië', speciality: 'time_trialist', bio: 'Jonge Britse tijdritkampioen met enorm vermogen.' },
    { name: 'Geraint Thomas', nationality: 'Groot-Brittannië', speciality: 'gc_contender', bio: 'Veteraan en Tourwinnaar 2018, nog steeds een factor.' },
    { name: 'Ben Turner', nationality: 'Groot-Brittannië', speciality: 'domestique', bio: 'Sterke Britse knecht en teamspeler.' },
    { name: 'Laurens De Plus', nationality: 'België', speciality: 'domestique', bio: 'Betrouwbare Belgische ploegrijder.' },
  ],
  'Alpecin – Premier Tech': [
    { name: 'Mathieu van der Poel', nationality: 'Nederland', speciality: 'puncheur', bio: 'Veeltalige Nederlander, wereldkampioen en gevaarlijkste man in het peloton.' },
    { name: 'Jasper Philipsen', nationality: 'België', speciality: 'sprinter', bio: 'Een van de beste sprinters in het peloton, meervoudig etappewinnar.' },
    { name: 'Kaden Groves', nationality: 'Australië', speciality: 'sprinter', bio: 'Snelle Australiër die zijn plek als sprint-kopman opeist.' },
    { name: 'Jonas Rickaert', nationality: 'België', speciality: 'domestique', bio: 'Onmisbare helper en leadout-man voor de sprinters.' },
    { name: 'Søren Wærenskjold', nationality: 'Noorwegen', speciality: 'time_trialist', bio: 'Noors talent met een enorm vermogen in tijdritten.' },
    { name: 'Silvan Dillier', nationality: 'Zwitserland', speciality: 'domestique', bio: 'Betrouwbare Zwitserse knecht.' },
    { name: 'Milan Menten', nationality: 'België', speciality: 'domestique', bio: 'Belgische ploegrijder.' },
    { name: 'Gianni Vermeersch', nationality: 'België', speciality: 'puncheur', bio: 'Veelzijdige Belg die goed presteert op oneffen terrein.' },
  ],
  'Lidl – Trek': [
    { name: 'Juan Ayuso', nationality: 'Spanje', speciality: 'gc_contender', bio: 'Jonge Spaanse ster, klaar om mee te doen aan de top van het klassement.' },
    { name: 'Giulio Ciccone', nationality: 'Italië', speciality: 'climber', bio: 'Italiaanse klimmer en drager van de bolletjestrui.' },
    { name: 'Mattias Skjelmose', nationality: 'Denemarken', speciality: 'climber', bio: 'Jonge Deen met een schitterende klimcapaciteit.' },
    { name: 'Mads Pedersen', nationality: 'Denemarken', speciality: 'sprinter', bio: 'Wereldkampioen 2019, sterk in sprint én op oneffen terrein.' },
    { name: 'Quinn Simmons', nationality: 'VS', speciality: 'puncheur', bio: 'Amerikaanse puncheur en allrounder.' },
    { name: 'Mathias Vacek', nationality: 'Tsjechië', speciality: 'domestique', bio: 'Jonge Tsjech die zijn plek in het peloton opeist.' },
    { name: 'Alex Kirsch', nationality: 'Luxemburg', speciality: 'domestique', bio: 'Luxemburgse knecht en ploegrijder.' },
    { name: 'Ryan Mullen', nationality: 'Ierland', speciality: 'time_trialist', bio: 'Ierse tijdritspecialist.' },
  ],
  'Soudal – QuickStep': [
    { name: 'Tim Merlier', nationality: 'België', speciality: 'sprinter', bio: 'Belgische sprintbom — een van de snelsten in het peloton.' },
    { name: 'Mikel Landa', nationality: 'Spanje', speciality: 'climber', bio: 'Ervaren Spaanse klimmer met GC-ambities.' },
    { name: 'Jasper Stuyven', nationality: 'België', speciality: 'puncheur', bio: 'Belgische klassiekerspecialist die ook in de Tour kan schitteren.' },
    { name: 'Ilan Van Wilder', nationality: 'België', speciality: 'climber', bio: 'Jonge Belgische klimmer en veelbelovend talent.' },
    { name: 'Valentin Paret-Peintre', nationality: 'Frankrijk', speciality: 'climber', bio: 'Franse klimmer die grote stappen zet.' },
    { name: 'Yves Lampaert', nationality: 'België', speciality: 'time_trialist', bio: 'Sterke Belgische tijdrijder.' },
    { name: 'Andrea Bagioli', nationality: 'Italië', speciality: 'domestique', bio: 'Italiaanse ploegrijder.' },
    { name: 'Louis Vervaeke', nationality: 'België', speciality: 'domestique', bio: 'Belgische knecht met klimpoten.' },
  ],
  'Decathlon AG2R La Mondiale': [
    { name: 'Ben O\'Connor', nationality: 'Australië', speciality: 'climber', bio: 'Australische klimmer die in 2021 al 4e werd in de Tour.' },
    { name: 'Olav Kooij', nationality: 'Nederland', speciality: 'sprinter', bio: 'Jonge Nederlandse sprinter met enorm potentieel.' },
    { name: 'Felix Gall', nationality: 'Oostenrijk', speciality: 'climber', bio: 'Oostenrijkse klimmer die steeds meer van zich laat horen.' },
    { name: 'Clément Berthet', nationality: 'Frankrijk', speciality: 'climber', bio: 'Franse klimmer.' },
    { name: 'Dorian Godon', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Franse ploegrijder.' },
    { name: 'Geoffrey Bouchard', nationality: 'Frankrijk', speciality: 'climber', bio: 'Specialist bergklassement.' },
    { name: 'Silvan Dillier', nationality: 'Zwitserland', speciality: 'domestique', bio: 'Knecht.' },
    { name: 'Nicholas Prodhomme', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Betrouwbare ploegrijder.' },
  ],
  'Bahrain Victorious': [
    { name: 'Lenny Martinez', nationality: 'Frankrijk', speciality: 'climber', bio: 'Jonge Franse belofte die de top bestormt.' },
    { name: 'Antonio Tiberi', nationality: 'Italië', speciality: 'gc_contender', bio: 'Jonge Italiaan met grote GC-ambities.' },
    { name: 'Matej Mohorič', nationality: 'Slovenia', speciality: 'puncheur', bio: 'Explosieve Sloveen en specialist in lange ontsnappingen.' },
    { name: 'Pello Bilbao', nationality: 'Spanje', speciality: 'climber', bio: 'Spaanse klimmer en gevaarlijke aanvaller.' },
    { name: 'Damiano Caruso', nationality: 'Italië', speciality: 'climber', bio: 'Ervaren Italiaanse klimmer.' },
    { name: 'Jack Haig', nationality: 'Australië', speciality: 'climber', bio: 'Australische klimmer.' },
    { name: 'Wout Poels', nationality: 'Nederland', speciality: 'climber', bio: 'Nederlandse klimmer en ervaren knecht.' },
    { name: 'Phil Bauhaus', nationality: 'Duitsland', speciality: 'sprinter', bio: 'Duitse sprinter.' },
  ],
  'EF Education – EasyPost': [
    { name: 'Richard Carapaz', nationality: 'Ecuador', speciality: 'climber', bio: 'Giro-winnaar en olympisch kampioen. Een gevaarlijke aanvaller in de bergen.' },
    { name: 'Neilson Powless', nationality: 'VS', speciality: 'climber', bio: 'Veelzijdige Amerikaan die ook meedoet voor het klassement.' },
    { name: 'Ben Healy', nationality: 'Ierland', speciality: 'puncheur', bio: 'Ierse puncheur met explosieve capaciteiten.' },
    { name: 'Magnus Cort', nationality: 'Denemarken', speciality: 'puncheur', bio: 'Deense etappespecialist, gevaarlijk op heuvelachtig terrein.' },
    { name: 'Einer Rubio', nationality: 'Colombia', speciality: 'climber', bio: 'Colombiaanse klimmer.' },
    { name: 'Stefan Bissegger', nationality: 'Zwitserland', speciality: 'time_trialist', bio: 'Zwitserse tijdritspecialist.' },
    { name: 'Hugh Carthy', nationality: 'Groot-Brittannië', speciality: 'climber', bio: 'Britse klimmer.' },
    { name: 'Marijn van den Berg', nationality: 'Nederland', speciality: 'sprinter', bio: 'Nederlandse sprinter.' },
  ],
  'Team Jayco – AlUla': [
    { name: 'Simon Yates', nationality: 'Groot-Brittannië', speciality: 'climber', bio: 'Vuelta-winnaar met aanvallende stijl in de bergen.' },
    { name: 'Dylan Groenewegen', nationality: 'Nederland', speciality: 'sprinter', bio: 'Een van de snelste sprinters in het peloton.' },
    { name: 'Luke Plapp', nationality: 'Australië', speciality: 'gc_contender', bio: 'Jonge Australische veelbelovende renner.' },
    { name: 'Michael Matthews', nationality: 'Australië', speciality: 'puncheur', bio: 'Australische klassieker- en etappespecialist.' },
    { name: 'Chris Harper', nationality: 'Australië', speciality: 'domestique', bio: 'Australische knecht.' },
    { name: 'Callum Scotson', nationality: 'Australië', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Nico Denz', nationality: 'Duitsland', speciality: 'domestique', bio: 'Duitse knecht.' },
    { name: 'Cyrus Monk', nationality: 'Australië', speciality: 'domestique', bio: 'Australisch talent.' },
  ],
  'Movistar': [
    { name: 'Enric Mas', nationality: 'Spanje', speciality: 'gc_contender', bio: 'Spaanse klimmer die meedoet aan de top van het klassement.' },
    { name: 'Carlos Verona', nationality: 'Spanje', speciality: 'domestique', bio: 'Spaanse knecht.' },
    { name: 'Oier Lazkano', nationality: 'Spanje', speciality: 'puncheur', bio: 'Spaanse puncheur.' },
    { name: 'Einer Augusto Rubio', nationality: 'Colombia', speciality: 'climber', bio: 'Colombiaanse klimmer.' },
    { name: 'Ivan Sosa', nationality: 'Colombia', speciality: 'climber', bio: 'Colombiaans klimtalent.' },
    { name: 'Antonio Pedrero', nationality: 'Spanje', speciality: 'climber', bio: 'Spaanse klimmer.' },
    { name: 'Álvaro Gómez', nationality: 'Spanje', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Gonzalo Serrano', nationality: 'Spanje', speciality: 'domestique', bio: 'Spaanse knecht.' },
  ],
  'Team Picnic PostNL': [
    { name: 'Frank van den Broek', nationality: 'Nederland', speciality: 'sprinter', bio: 'Jonge Nederlandse sprintster die de wereld verbaast.' },
    { name: 'Warren Barguil', nationality: 'Frankrijk', speciality: 'climber', bio: 'Ervaren Franse klimmer en bolletjestrutdrager.' },
    { name: 'Pavel Bittner', nationality: 'Tsjechië', speciality: 'sprinter', bio: 'Tsjechische sprint-belofte.' },
    { name: 'Taco van der Hoorn', nationality: 'Nederland', speciality: 'puncheur', bio: 'Nederlandse allrounder.' },
    { name: 'Boy van Poppel', nationality: 'Nederland', speciality: 'sprinter', bio: 'Ervaren Nederlandse sprinter.' },
    { name: 'Jan Bakelants', nationality: 'België', speciality: 'domestique', bio: 'Belgische veteraan.' },
    { name: 'Lars Boven', nationality: 'Nederland', speciality: 'domestique', bio: 'Nederlandse ploegrijder.' },
    { name: 'Nils Eekhoff', nationality: 'Nederland', speciality: 'domestique', bio: 'Nederlandse allrounder.' },
  ],
  'Lotto – Intermarché': [
    { name: 'Lennert Van Eetvelt', nationality: 'België', speciality: 'climber', bio: 'Jonge Belgische klimmer die de grote ronden opschudt.' },
    { name: 'Arnaud De Lie', nationality: 'België', speciality: 'sprinter', bio: 'Explosieve Belgische sprinter, een van de talentvolste van zijn generatie.' },
    { name: 'Rune Herregodts', nationality: 'België', speciality: 'puncheur', bio: 'Veelzijdige Belgische renner.' },
    { name: 'Jan Hirt', nationality: 'Tsjechië', speciality: 'climber', bio: 'Ervaren Tsjechische klimmer.' },
    { name: 'Louis Meintjes', nationality: 'Noorwegen', speciality: 'climber', bio: 'Klimmer uit Afrika.' },
    { name: 'Kobe Goossens', nationality: 'België', speciality: 'domestique', bio: 'Belgische knecht.' },
    { name: 'Andreas Kron', nationality: 'Denemarken', speciality: 'puncheur', bio: 'Deense puncheur.' },
    { name: 'Jonas Vingegaard', nationality: 'Denemarken', speciality: 'domestique', bio: 'Reserveknecht.' },
  ],
  'Arkéa – B&B Hotels': [
    { name: 'Harold Tejada', nationality: 'Colombia', speciality: 'climber', bio: 'Colombiaanse klimmer.' },
    { name: 'Thibault Guernalec', nationality: 'Frankrijk', speciality: 'climber', bio: 'Franse belofte.' },
    { name: 'Kévin Ledanois', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Franse knecht.' },
    { name: 'Alan Riou', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Franse ploegrijder.' },
    { name: 'Donavan Grondin', nationality: 'Frankrijk', speciality: 'puncheur', bio: 'Frans talent.' },
    { name: 'Romain Hardy', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Alexis Guérin', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Amaël Moinard', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Ervaren ploegrijder.' },
  ],
  'XDS Astana': [
    { name: 'Aleksej Lutsenko', nationality: 'Kazachstan', speciality: 'puncheur', bio: 'Kazachse puncheur en etappespecialist.' },
    { name: 'Harold Tejada', nationality: 'Colombia', speciality: 'climber', bio: 'Colombiaanse klimmer.' },
    { name: 'Lorenzo Fortunato', nationality: 'Italië', speciality: 'climber', bio: 'Italiaanse klimmer.' },
    { name: 'Mark Cavendish', nationality: 'Groot-Brittannië', speciality: 'sprinter', bio: 'Recordwinnaar van Tour-etappes.' },
    { name: 'Gianluca Brambilla', nationality: 'Italië', speciality: 'climber', bio: 'Italiaanse klimmer.' },
    { name: 'Davide Ballerini', nationality: 'Italië', speciality: 'sprinter', bio: 'Italiaanse sprinter.' },
    { name: 'Yevgeniy Fedorov', nationality: 'Kazachstan', speciality: 'domestique', bio: 'Kazachse knecht.' },
    { name: 'Cees Bol', nationality: 'Nederland', speciality: 'sprinter', bio: 'Nederlandse sprinter.' },
  ],
  'Groupama – FDJ': [
    { name: 'David Gaudu', nationality: 'Frankrijk', speciality: 'climber', bio: 'Franse klimmer en GC-kandidaat.' },
    { name: 'Thibaut Pinot', nationality: 'Frankrijk', speciality: 'climber', bio: 'Legendarische Franse klimmer.' },
    { name: 'Bruno Armirail', nationality: 'Frankrijk', speciality: 'time_trialist', bio: 'Tijdritspecialist.' },
    { name: 'Stefan Küng', nationality: 'Zwitserland', speciality: 'time_trialist', bio: 'Zwitserse tijdritkampioen.' },
    { name: 'Miles Scotson', nationality: 'Australië', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Jake Stewart', nationality: 'Groot-Brittannië', speciality: 'puncheur', bio: 'Britse allrounder.' },
    { name: 'Tobias Ludvigsson', nationality: 'Zweden', speciality: 'domestique', bio: 'Zweedse knecht.' },
    { name: 'Quentin Pacher', nationality: 'Frankrijk', speciality: 'climber', bio: 'Franse klimmer.' },
  ],
  'Cofidis': [
    { name: 'Guillaume Martin', nationality: 'Frankrijk', speciality: 'climber', bio: 'Filosoferende Franse klimmer.' },
    { name: 'Elia Viviani', nationality: 'Italië', speciality: 'sprinter', bio: 'Olympisch kampioen op de baan.' },
    { name: 'Søren Kragh Andersen', nationality: 'Denemarken', speciality: 'puncheur', bio: 'Deense etappewinnaar.' },
    { name: 'Pierre-Luc Périchon', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Franse knecht.' },
    { name: 'Tom Bohli', nationality: 'Zwitserland', speciality: 'domestique', bio: 'Zwitserse ploegrijder.' },
    { name: 'Julien Simon', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Veteraan.' },
    { name: 'Christophe Laporte', nationality: 'Frankrijk', speciality: 'sprinter', bio: 'Snelle Fransman.' },
    { name: 'Attila Valter', nationality: 'Hongarije', speciality: 'climber', bio: 'Hongaarse klimmer.' },
  ],
  'Tudor Pro Cycling': [
    { name: 'Giacomo Nizzolo', nationality: 'Italië', speciality: 'sprinter', bio: 'Italiaanse sprinter.' },
    { name: 'Yevgeniy Fedorov', nationality: 'Kazachstan', speciality: 'climber', bio: 'Kazachse klimmer.' },
    { name: 'Marc Soler', nationality: 'Spanje', speciality: 'climber', bio: 'Spaanse klimmer.' },
    { name: 'Edvald Boasson Hagen', nationality: 'Noorwegen', speciality: 'puncheur', bio: 'Noorse allrounder.' },
    { name: 'Reto Hollenstein', nationality: 'Zwitserland', speciality: 'domestique', bio: 'Zwitserse knecht.' },
    { name: 'Fabian Lienhard', nationality: 'Zwitserland', speciality: 'domestique', bio: 'Zwitserse belofte.' },
    { name: 'Robin Carpenter', nationality: 'VS', speciality: 'domestique', bio: 'Amerikaanse ploegrijder.' },
    { name: 'Lukas Pöstlberger', nationality: 'Oostenrijk', speciality: 'puncheur', bio: 'Oostenrijkse puncheur.' },
  ],
  'TotalEnergies': [
    { name: 'Søren Wærenskjold', nationality: 'Noorwegen', speciality: 'time_trialist', bio: 'Noorse tijdritkampioen.' },
    { name: 'Cristian Rodriguez', nationality: 'Spanje', speciality: 'climber', bio: 'Spaanse klimmer.' },
    { name: 'Anthony Turgis', nationality: 'Frankrijk', speciality: 'puncheur', bio: 'Franse puncheur.' },
    { name: 'Steff Cras', nationality: 'België', speciality: 'climber', bio: 'Belgische klimmer.' },
    { name: 'Dries Van Gestel', nationality: 'België', speciality: 'sprinter', bio: 'Belgische sprinter.' },
    { name: 'Julien Bernard', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Franse knecht.' },
    { name: 'Alexis Renard', nationality: 'Frankrijk', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Connor Swift', nationality: 'Groot-Brittannië', speciality: 'sprinter', bio: 'Britse sprinter.' },
  ],
  'Pinarello – Q36.5': [
    { name: 'Marco Haller', nationality: 'Oostenrijk', speciality: 'domestique', bio: 'Oostenrijkse knecht.' },
    { name: 'Mirco Maestri', nationality: 'Italië', speciality: 'domestique', bio: 'Italiaanse ontsnappingsspecialist.' },
    { name: 'Nicolas Edet', nationality: 'Frankrijk', speciality: 'climber', bio: 'Franse klimmer.' },
    { name: 'Alessandro Tonelli', nationality: 'Italië', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Filippo Ganna', nationality: 'Italië', speciality: 'time_trialist', bio: 'Meervoudig wereldkampioen tijdrijden.' },
    { name: 'Remi Cavagna', nationality: 'Frankrijk', speciality: 'time_trialist', bio: 'Franse tijdritspecialist.' },
    { name: 'Jacopo Mosca', nationality: 'Italië', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Bert Van Lerberghe', nationality: 'België', speciality: 'domestique', bio: 'Belgische knecht.' },
  ],
  'Caja Rural – Seguros RGA': [
    { name: 'Carlos Barbero', nationality: 'Spanje', speciality: 'domestique', bio: 'Spaanse ploegrijder.' },
    { name: 'Eduardo Sepúlveda', nationality: 'Argentina', speciality: 'climber', bio: 'Argentijnse klimmer.' },
    { name: 'Jonathan Lastra', nationality: 'Spanje', speciality: 'climber', bio: 'Spaanse klimmer.' },
    { name: 'Nans Peters', nationality: 'Frankrijk', speciality: 'climber', bio: 'Franse ontsnappingsspecialist.' },
    { name: 'Thomas De Gendt', nationality: 'België', speciality: 'climber', bio: 'Belgische ontsnappingsspecialist.' },
    { name: 'Sergio Roman Martin', nationality: 'Spanje', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Raúl García Pierna', nationality: 'Spanje', speciality: 'domestique', bio: 'Ploegrijder.' },
    { name: 'Luis Ángel Maté', nationality: 'Spanje', speciality: 'climber', bio: 'Ervaren klimmer.' },
  ],
  'Intermarché Wanty': [
    { name: 'Georg Zimmermann', nationality: 'Duitsland', speciality: 'climber', bio: 'Duitse klimmer.' },
    { name: 'Lorenzo Rota', nationality: 'Italië', speciality: 'climber', bio: 'Italiaanse klimmer.' },
    { name: 'Gerben Thijssen', nationality: 'België', speciality: 'sprinter', bio: 'Belgische sprinter.' },
    { name: 'Biniam Girmay', nationality: 'Eritrea', speciality: 'puncheur', bio: 'Eritrese puncheur, eerste Afrikaan die een Touretappe won.' },
    { name: 'Emils Liepins', nationality: 'Letland', speciality: 'domestique', bio: 'Letse knecht.' },
    { name: 'Loïc Vliegen', nationality: 'België', speciality: 'domestique', bio: 'Belgische ploegrijder.' },
    { name: 'Jan Bakelants', nationality: 'België', speciality: 'domestique', bio: 'Belgische veteraan.' },
    { name: 'Oliver Naesen', nationality: 'België', speciality: 'puncheur', bio: 'Belgische klassiekerrider.' },
  ],
};

// ─── STAGES ───────────────────────────────────────────────────────────────────
const STAGES = [
  {
    stageNumber: 1, date: '2026-07-04', startLocation: 'Barcelona', finishLocation: 'Barcelona',
    type: 'team_time_trial' as const, distanceKm: 20, elevationMeters: 150,
    description: 'De Tour de France 2026 opent met een spectaculaire ploegentijdrit door de straten van Barcelona. Teams starten met 8 minuten verschil en rijden door de iconische boulevard La Rambla.',
    climbs: [], isSprintStage: false, isMountainStage: false,
  },
  {
    stageNumber: 2, date: '2026-07-05', startLocation: 'Barcelona', finishLocation: 'Barcelona (Montjuïc)',
    type: 'hilly' as const, distanceKm: 178, elevationMeters: 2800,
    description: 'Een heuvelachtige etappe met de finish op de Montjuïc, de olympische heuvel van Barcelona. Puncheurs en klimmers maken hier kans op de etappewinst.',
    climbs: [
      { name: 'Montjuïc', category: '2', altitude: 173, lengthKm: 4.5, avgGradient: 4.8 },
    ],
    isSprintStage: false, isMountainStage: false,
  },
  {
    stageNumber: 3, date: '2026-07-06', startLocation: 'Ripoll', finishLocation: 'Andorra la Vella',
    type: 'mountain' as const, distanceKm: 157, elevationMeters: 4200,
    description: 'De eerste echte bergetappe voert van Catalonië door de Pyreneeën naar Andorra. Twee HC-klimmingen bepalen het koersverloop, met een bergfinish in Andorra.',
    climbs: [
      { name: 'Collada de la Gallina', category: 'HC', altitude: 1910, lengthKm: 10.2, avgGradient: 8.5 },
      { name: 'Coll d\'Ordino', category: '1', altitude: 1980, lengthKm: 9.8, avgGradient: 7.2 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 4, date: '2026-07-07', startLocation: 'Andorra la Vella', finishLocation: 'Toulouse',
    type: 'hilly' as const, distanceKm: 195, elevationMeters: 2100,
    description: 'Afdaling vanuit de Pyreneeën richting Toulouse. Heuvelachtig terrein met kansen voor ontsnappingen en puncheurs op de finale.',
    climbs: [
      { name: 'Col de Puymorens', category: '2', altitude: 1915, lengthKm: 8.0, avgGradient: 5.5 },
    ],
    isSprintStage: false, isMountainStage: false,
  },
  {
    stageNumber: 5, date: '2026-07-08', startLocation: 'Carcassonne', finishLocation: 'Nîmes',
    type: 'flat' as const, distanceKm: 212, elevationMeters: 400,
    description: 'Een vlakke etappe langs de Languedoc-kust, ideaal voor de sprinters. Het peloton rijdt langs de prachtige middeleeuwse stad Carcassonne.',
    climbs: [], isSprintStage: true, isMountainStage: false,
  },
  {
    stageNumber: 6, date: '2026-07-09', startLocation: 'Montpellier', finishLocation: 'Nîmes',
    type: 'flat' as const, distanceKm: 186, elevationMeters: 200,
    description: 'Tweede vlakke sprint-etappe in het zuiden van Frankrijk. Een massasprint verwacht aan de finish in Nîmes.',
    climbs: [], isSprintStage: true, isMountainStage: false,
  },
  {
    stageNumber: 7, date: '2026-07-10', startLocation: 'Millau', finishLocation: 'Rodez',
    type: 'hilly' as const, distanceKm: 168, elevationMeters: 2600,
    description: 'Een gevarieerde etappe met de imposante Millau-viaduct als decor. Het Centraal Massief tekent de route, met kansen voor ontsnappingen.',
    climbs: [
      { name: 'Côte de Sévérac', category: '3', altitude: 760, lengthKm: 4.5, avgGradient: 5.2 },
    ],
    isSprintStage: false, isMountainStage: false,
  },
  {
    stageNumber: 8, date: '2026-07-11', startLocation: 'Aurillac', finishLocation: 'Le Lioran',
    type: 'mountain' as const, distanceKm: 142, elevationMeters: 3600,
    description: 'Bergetappe in het Centraal Massief met aankomst bergop in Le Lioran. De klimmers gaan het klassement in beweging brengen op de steile straten van de eindklim.',
    climbs: [
      { name: 'Pas de Peyrol', category: '1', altitude: 1589, lengthKm: 7.2, avgGradient: 8.1 },
      { name: 'Le Lioran', category: '1', altitude: 1160, lengthKm: 8.0, avgGradient: 6.5 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 9, date: '2026-07-12', startLocation: 'Issoire', finishLocation: 'Lyon',
    type: 'flat' as const, distanceKm: 200, elevationMeters: 800,
    description: 'Afdaling richting Lyon. Na de zware bergdag hergroeperen de sprinters zich voor de aankomst in de Gastronomische Hoofdstad van Frankrijk.',
    climbs: [], isSprintStage: true, isMountainStage: false,
  },
  {
    stageNumber: 10, date: '2026-07-14', startLocation: 'Mulhouse', finishLocation: 'La Planche des Belles Filles',
    type: 'mountain' as const, distanceKm: 155, elevationMeters: 3200,
    description: 'Op de Franse nationale feestdag (14 juli) een bergetappe met de legendarische La Planche des Belles Filles als eindklim. De winnaar is dit jaar een held van Frankrijk.',
    climbs: [
      { name: 'Ballon d\'Alsace', category: '1', altitude: 1178, lengthKm: 9.0, avgGradient: 6.8 },
      { name: 'La Planche des Belles Filles', category: 'HC', altitude: 1148, lengthKm: 6.0, avgGradient: 8.5 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 11, date: '2026-07-15', startLocation: 'Cernay', finishLocation: 'Le Markstein',
    type: 'mountain' as const, distanceKm: 148, elevationMeters: 3800,
    description: 'Zware bergetappe in de Vogezen met aankomst op Le Markstein. Vier beklimmingen maken dit een van de zwaarste etappes van de Tour.',
    climbs: [
      { name: 'Grand Ballon', category: '1', altitude: 1424, lengthKm: 12.5, avgGradient: 6.5 },
      { name: 'Col de Firstplan', category: '3', altitude: 728, lengthKm: 4.5, avgGradient: 5.2 },
      { name: 'Le Markstein', category: '1', altitude: 1183, lengthKm: 9.0, avgGradient: 6.0 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 12, date: '2026-07-16', startLocation: 'Colmar', finishLocation: 'Besançon',
    type: 'flat' as const, distanceKm: 196, elevationMeters: 600,
    description: 'Vlakke etappe door de Elzas en Franche-Comté. Een sprint verwacht in de mooie vestingstad Besançon.',
    climbs: [], isSprintStage: true, isMountainStage: false,
  },
  {
    stageNumber: 13, date: '2026-07-17', startLocation: 'Besançon', finishLocation: 'Pontarlier',
    type: 'hilly' as const, distanceKm: 172, elevationMeters: 2200,
    description: 'Heuvelachtige etappe richting Pontarlier aan de Zwitserse grens. Ideaal voor puncheurs en vluchters.',
    climbs: [
      { name: 'Côte des Hôpitaux-Neufs', category: '2', altitude: 1008, lengthKm: 6.2, avgGradient: 5.8 },
    ],
    isSprintStage: false, isMountainStage: false,
  },
  {
    stageNumber: 14, date: '2026-07-18', startLocation: 'Champagnole', finishLocation: 'Dijon',
    type: 'time_trial' as const, distanceKm: 38, elevationMeters: 300,
    description: 'Individuele tijdrit door de Jura. De tijdrijders zijn aan zet — dit is de dag waarop het klassement op zijn kop kan gaan.',
    climbs: [], isSprintStage: false, isMountainStage: false,
  },
  {
    stageNumber: 15, date: '2026-07-19', startLocation: 'Cluses', finishLocation: 'Plateau de Solaison',
    type: 'mountain' as const, distanceKm: 160, elevationMeters: 4500,
    description: 'Zware alpine etappe met aankomst op het Plateau de Solaison. De Alpen beginnen — de renners moeten drie beklimmingen overwinnen.',
    climbs: [
      { name: 'Col de la Colombière', category: 'HC', altitude: 1613, lengthKm: 11.7, avgGradient: 7.5 },
      { name: 'Col de la Ramaz', category: '1', altitude: 1619, lengthKm: 13.7, avgGradient: 7.1 },
      { name: 'Plateau de Solaison', category: 'HC', altitude: 1452, lengthKm: 11.0, avgGradient: 8.8 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 16, date: '2026-07-20', startLocation: 'Évian-les-Bains', finishLocation: 'Thonon-les-Bains',
    type: 'flat' as const, distanceKm: 145, elevationMeters: 500,
    description: 'Rustdag voor de sprinters aan het Meer van Genève. Een korte vlakke etappe waarbij het peloton hergroepeerd voor de grote bergdagen.',
    climbs: [], isSprintStage: true, isMountainStage: false,
  },
  {
    stageNumber: 17, date: '2026-07-21', startLocation: 'Chambéry', finishLocation: 'Voiron',
    type: 'hilly' as const, distanceKm: 172, elevationMeters: 2400,
    description: 'Heuvelachtige etappe rondom Chambéry. De Chartreuse staat garant voor klassieke wielrenervaringen.',
    climbs: [
      { name: 'Col du Cucheron', category: '2', altitude: 1139, lengthKm: 7.8, avgGradient: 6.9 },
    ],
    isSprintStage: false, isMountainStage: false,
  },
  {
    stageNumber: 18, date: '2026-07-22', startLocation: 'Voiron', finishLocation: 'Orcières-Merlette',
    type: 'mountain' as const, distanceKm: 158, elevationMeters: 4000,
    description: 'Alpenetappe met aankomst bergop in Orcières-Merlette. De klimmers gaan los in deze zwaar gewogen etappe.',
    climbs: [
      { name: 'Col de Manse', category: '1', altitude: 1268, lengthKm: 15.0, avgGradient: 5.5 },
      { name: 'Orcières-Merlette', category: 'HC', altitude: 1838, lengthKm: 7.2, avgGradient: 6.7 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 19, date: '2026-07-23', startLocation: 'Gap', finishLocation: 'Alpe d\'Huez',
    type: 'mountain' as const, distanceKm: 165, elevationMeters: 5000,
    description: 'Zware bergetappe naar de iconische Alpe d\'Huez. Via de Col du Galibier en de Col de la Croix de Fer stijgt het peloton naar de heilige berg van de Tour de France.',
    climbs: [
      { name: 'Col du Galibier', category: 'HC', altitude: 2645, lengthKm: 18.1, avgGradient: 6.9 },
      { name: 'Col de la Croix de Fer', category: 'HC', altitude: 2067, lengthKm: 22.4, avgGradient: 5.2 },
      { name: 'Alpe d\'Huez', category: 'HC', altitude: 1860, lengthKm: 13.8, avgGradient: 8.1 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 20, date: '2026-07-24', startLocation: 'Bourg d\'Oisans', finishLocation: 'Alpe d\'Huez',
    type: 'mountain' as const, distanceKm: 132, elevationMeters: 4800,
    description: 'Koningsetappe! Dubbele beklimming van de Alpe d\'Huez. Dit is wielrengeschiedenis — twee keer de heilige berg op één dag. De aanval van de eeuwigheid.',
    climbs: [
      { name: 'Alpe d\'Huez (eerste keer)', category: 'HC', altitude: 1860, lengthKm: 13.8, avgGradient: 8.1 },
      { name: 'Col de Sarenne', category: '1', altitude: 1999, lengthKm: 12.0, avgGradient: 6.9 },
      { name: 'Alpe d\'Huez (tweede keer)', category: 'HC', altitude: 1860, lengthKm: 13.8, avgGradient: 8.1 },
    ],
    isSprintStage: false, isMountainStage: true,
  },
  {
    stageNumber: 21, date: '2026-07-26', startLocation: 'Thoiry', finishLocation: 'Parijs (Champs-Élysées)',
    type: 'flat' as const, distanceKm: 122, elevationMeters: 400,
    description: 'De ceremoniele slotetappe voert het peloton naar de meest beroemde avenue ter wereld. Via de Montmartre rijdt de leider in het geel naar zijn triomf op de Champs-Élysées.',
    climbs: [
      { name: 'Côte de Montmartre', category: '4', altitude: 108, lengthKm: 1.2, avgGradient: 8.0 },
    ],
    isSprintStage: true, isMountainStage: false,
  },
];

async function seed() {
  console.log('🌱 Tour de Wognum seed script gestart...\n');

  // ─── TEAMS ──────────────────────────────────────────────────────────────────
  console.log('📋 Teams aanmaken...');
  const teamMap: Record<string, string> = {};

  for (const team of TEAMS) {
    const existing = await db.select({ id: schema.teams.id }).from(schema.teams).where(eq(schema.teams.name, team.name));
    if (existing.length > 0) {
      teamMap[team.name] = existing[0].id;
      continue;
    }
    const [inserted] = await db.insert(schema.teams).values(team).returning({ id: schema.teams.id });
    teamMap[team.name] = inserted.id;
    console.log(`  ✓ ${team.name}`);
  }

  // ─── RIDERS ─────────────────────────────────────────────────────────────────
  console.log('\n🚴 Renners aanmaken...');
  let riderCount = 0;
  for (const [teamName, teamRiders] of Object.entries(RIDERS_BY_TEAM)) {
    const teamId = teamMap[teamName];
    if (!teamId) { console.log(`  ⚠️ Team niet gevonden: ${teamName}`); continue; }

    for (const rider of teamRiders) {
      const existing = await db.select({ id: schema.riders.id }).from(schema.riders).where(eq(schema.riders.name, rider.name));
      if (existing.length > 0) continue;
      await db.insert(schema.riders).values({ ...rider, teamId, isActive: true });
      riderCount++;
    }
  }
  console.log(`  ✓ ${riderCount} renners aangemaakt`);

  // ─── STAGES ─────────────────────────────────────────────────────────────────
  console.log('\n📍 Etappes aanmaken...');
  for (const stage of STAGES) {
    const existing = await db.select({ id: schema.stages.id }).from(schema.stages).where(eq(schema.stages.stageNumber, stage.stageNumber));
    if (existing.length > 0) continue;
    await db.insert(schema.stages).values({ ...stage, status: 'planned', climbs: stage.climbs as any });
    console.log(`  ✓ Etappe ${stage.stageNumber}: ${stage.startLocation} → ${stage.finishLocation}`);
  }

  // ─── SETTINGS ───────────────────────────────────────────────────────────────
  console.log('\n⚙️ Instellingen...');
  await db.insert(schema.settings).values({ key: 'registration_open', value: 'true' }).onConflictDoNothing();

  // ─── TEST PARTICIPANTS ───────────────────────────────────────────────────────
  console.log('\n👥 Test-deelnemers aanmaken...');
  const allRiders = await db.select({ id: schema.riders.id, name: schema.riders.name }).from(schema.riders);
  const allStages = await db.select({ id: schema.stages.id, stageNumber: schema.stages.stageNumber }).from(schema.stages);

  const testParticipants = [
    { name: 'Jan Wielrenner', email: 'jan@test.nl', dateOfBirth: '1985-03-15', iban: 'NL91ABNA0417164300' },
    { name: 'Piet Peloton', email: 'piet@test.nl', dateOfBirth: '1990-07-22', iban: 'NL91ABNA0417164301' },
    { name: 'Marie Fietser', email: 'marie@test.nl', dateOfBirth: '1995-01-08', iban: 'NL91ABNA0417164302' },
    { name: 'Kees van Wognum', email: 'kees@test.nl', dateOfBirth: '1978-11-30', iban: 'NL91ABNA0417164303' },
    { name: 'Ans Bergop', email: 'ans@test.nl', dateOfBirth: '2003-04-12', iban: 'NL91ABNA0417164304' },
    { name: 'Henk Klimmer', email: 'henk@test.nl', dateOfBirth: '1982-09-25', iban: 'NL91ABNA0417164305' },
    { name: 'Lies van den Berg', email: 'lies@test.nl', dateOfBirth: '2001-06-18', iban: 'NL91ABNA0417164306' },
    { name: 'Roel Sprint', email: 'roel@test.nl', dateOfBirth: '1988-02-14', iban: 'NL91ABNA0417164307' },
    { name: 'Truus Klassement', email: 'truus@test.nl', dateOfBirth: '1975-08-03', iban: 'NL91ABNA0417164308' },
    { name: 'Bart Tijdrit', email: 'bart@test.nl', dateOfBirth: '1993-12-07', iban: 'NL91ABNA0417164309' },
    { name: 'Daan Etappe', email: 'daan@test.nl', dateOfBirth: '2000-05-20', iban: 'NL91ABNA0417164310' },
    { name: 'Fien Podium', email: 'fien@test.nl', dateOfBirth: '1997-10-11', iban: 'NL91ABNA0417164311' },
  ];

  const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

  for (const p of testParticipants) {
    const existing = await db.select({ id: schema.participants.id }).from(schema.participants).where(eq(schema.participants.email, p.email));
    if (existing.length > 0) continue;

    const myRiders = shuffle(allRiders).slice(0, 20);
    const captainRider = myRiders[Math.floor(Math.random() * myRiders.length)];
    const goldenStage = allStages[Math.floor(Math.random() * allStages.length)];

    const [participant] = await db.insert(schema.participants).values({
      ...p,
      goldenStageId: goldenStage.id,
    }).returning();

    await db.insert(schema.participantRiders).values(
      myRiders.map(r => ({
        participantId: participant.id,
        riderId: r.id,
        isCaptain: r.id === captainRider.id,
      }))
    );

    const gcRiders = shuffle(allRiders).slice(0, 5);
    await db.insert(schema.participantGcPrediction).values(
      gcRiders.map((r, i) => ({
        participantId: participant.id,
        riderId: r.id,
        predictedPosition: i + 1,
      }))
    );

    console.log(`  ✓ ${p.name}`);
  }

  // ─── STAGE RESULTS (first 3 stages) ─────────────────────────────────────────
  console.log('\n🏁 Testresultaten voor etappes 1-3...');
  const stageResultsData = [
    {
      stageNum: 1,
      results: [
        'UAE Team Emirates', 'Visma | Lease a Bike', 'Red Bull – BORA – hansgrohe',
        'INEOS Grenadiers', 'Lidl – Trek', 'Soudal – QuickStep',
        'Alpecin – Premier Tech', 'Decathlon AG2R La Mondiale',
        'Bahrain Victorious', 'EF Education – EasyPost',
      ],
    },
    {
      stageNum: 2,
      results: [
        'Tadej Pogačar', 'Jonas Vingegaard', 'Remco Evenepoel',
        'Carlos Rodríguez', 'Juan Ayuso', 'Egan Bernal',
        'Lenny Martinez', 'Ben O\'Connor', 'Simon Yates', 'Enric Mas',
      ],
    },
    {
      stageNum: 3,
      results: [
        'Tadej Pogačar', 'Jonas Vingegaard', 'Florian Lipowitz',
        'Juan Ayuso', 'Remco Evenepoel', 'Carlos Rodríguez',
        'Richard Carapaz', 'Egan Bernal', 'Ben O\'Connor', 'Giulio Ciccone',
      ],
    },
  ];

  for (const sr of stageResultsData) {
    const [stage] = await db.select().from(schema.stages).where(eq(schema.stages.stageNumber, sr.stageNum));
    if (!stage) continue;

    await db.delete(schema.stageResults).where(eq(schema.stageResults.stageId, stage.id));

    for (let i = 0; i < sr.results.length; i++) {
      const name = sr.results[i];
      const [rider] = await db.select({ id: schema.riders.id }).from(schema.riders).where(eq(schema.riders.name, name));
      if (!rider) { console.log(`  ⚠️ Renner niet gevonden: ${name}`); continue; }

      await db.insert(schema.stageResults).values({
        stageId: stage.id,
        riderId: rider.id,
        position: i + 1,
        timeGap: i === 0 ? null : `0:${String(Math.floor(Math.random() * 3)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
      }).onConflictDoNothing();
    }

    await db.update(schema.stages).set({ status: 'completed' }).where(eq(schema.stages.id, stage.id));
    console.log(`  ✓ Etappe ${sr.stageNum} resultaten ingevoerd`);
  }

  // ─── CALCULATE VALUES ────────────────────────────────────────────────────────
  console.log('\n🔢 Waardecijfers berekenen...');
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(schema.participants);
  const total = Number(count);
  const allRidersForValues = await db.select({ id: schema.riders.id }).from(schema.riders);

  for (const rider of allRidersForValues) {
    const [{ timesChosen }] = await db
      .select({ timesChosen: sql<number>`count(*)` })
      .from(schema.participantRiders)
      .where(eq(schema.participantRiders.riderId, rider.id));

    const chosen = Number(timesChosen);
    const value = Math.max(1, total - chosen);

    await db.insert(schema.riderValues)
      .values({ riderId: rider.id, value, timesChosen: chosen })
      .onConflictDoUpdate({
        target: schema.riderValues.riderId,
        set: { value, timesChosen: chosen },
      });
  }
  console.log(`  ✓ Waardecijfers berekend voor ${allRidersForValues.length} renners`);

  console.log('\n✅ Seed compleet! 🚴\n');
}

seed().catch(console.error);
