const digits = [1,
    1,
    2,
    4,
    5,
    10,
    11,
    23,
    25,
    26,
    54,
    57,
    59,
    122,
    133,
    142,
    147,
    304,
    330,
    351,
    362,
    747,
    806,
    880,
    931,
    957,
    1968,
    2105,
    2275,
    2391,
    2450,
    5022,
    5336,
    5733,
    6155,
    6444,
    6591,
    13486,
    14267,
    15252,
    16295,
    17008,
    17370,
    35487,
    37402,
    39835,
    42452,
    45220,
    47108,
    48065,
    98098,
    103128,
    109476,
    116247,
    123363,
    128204,
    130654,
    266330,
    279138,
    295229,
    312453,
    330785,
    349975,
    363010,
    369601,
    752688,
    787032,
    830037,
    875851,
    924406,
    975079,
    1009457,
    1026827,
    2089141,
    2179400,
    2292124,
    2411813,
    2539320,
    2674100,
    2814493,
    2909666,
    2957731,
    6013560,
    6262851,
    6573553,
    6902404,
    7251490,
    7619304,
    8001525,
    8260383,
    8391037,
    17048404,
    17724526,
    18565223,
    19452043,
    20390510,
    21383723,
    22427493,
    23510079,
    24242690,
    24612291,
    49977270,
    51886591,
    54256348,
    56749268,
    59379562,
    62154898,
    65063840,
    68075203,
    70111487,
    71138314,
    144365769,
    149661137,
    156221802,
    163105139,
    170348396,
    177973629,
    186001542,
    194399801,
    203081691,
    208949088,
    211906819,
    429827198,
    445061340,
    463911304,
    483650112,
    504377559,
    526150757,
    549023076,
    572904288,
    597557233,
    614208653,
    622599690,
    1262247784,
    1305411751,
    1358749904,
    1414491696,
    1472899472,
    1534125748,
    1598327474,
    1665648769,
    1735829031,
    1808194091,
    1857049072,
    1881661363,
    3813299996,
    3939776148,
    4095896357,
    4258788564,
    4429173742,
    4607457470,
    4794055770,
    4989349711,
    5192600241,
    5401925245,
    5543175046,
    5614313360,
    11372992489,
    11738157709,
    12188406417,
    12657394495,
    13147069832,
    13658496996,
    14192820563,
    14751195535,
    15334678569,
    15941109149,
    16565046747,
    16985902654,
    17197809473,
    34825446144,
    35912241501,
    37251041343,
    38643664099,
    40095603074,
    41609781502,
    43189332894,
    44837411015,
    46556895612,
    48341565786,
    50175931362,
    51412739705,
    52035339395,
    105332926574,
    108523185799,
    112449595238,
    116528248589,
    120774389661,
    125195906577,
    129801259271,
    134599361262,
    139599166536,
    144808838427,
    150209910621,
    155756815147,
    159495525582,
    161377186945,
    326567673886,
    336202411393,
    348051383894,
    360345844963,
    373129703626,
    386425123402,
    400255810384,
    414646673335,
    429622679057,
    445206554254,
    461344254786,
    477903668437,
    489061156843,
    494675470203,
    1000723932895,
    1029449396453,
    1064748953068,
    1101332911689,
    1139325782433,
    1178788743756,
    1219787131147,
    1262389644241,
    1306668338908,
    1352695322161,
    1400536156626,
    1450028215176,
    1500776974050,
    1534960686177,
    1552158495650,
    3139142437444,
    3227077934562,
    3335066663550,
    3446873610493,
    3562863919009,
    3683212967684,
    3808107685154,
    3937744210565,
    4072327850086,
    4212063722499,
    4357138115259,
    4507068352112,
    4660692362574,
    4764140441674,
    4816175781069,
    9737684488712,
    10003575940480,
    10329881648091,
    10667382677717,
    11017134911205,
    11379633456032,
    11755405011541,
    12145001538651,
    12549001325720,
    12968008691945,
    13402626607529,
    13853402171724,
    14318864423074,
    14795493950748,
    15116366663275,
    15277743850220,
    30882055374326,
    31706202646550,
    32717024115723,
    33761623755973,
    34843150688456,
    35963051360447,
    37122861997859,
    38324189604980,
    39568714767756,
    40858190674402,
    42194364162499,
    43578818639976,
    45007127720042,
    46468768015525,
    47452504642571,
    47947180112774,
    96895084158443,
    99419932957994,
    102514855240410,
    105710386501620,
    109015794148810,
    112435241586688,
    115973143244024,
    119634108763168,
    123422953877464,
    127344707182774,
    131404607000469,
    135607866694432,
    139959208040284,
    144444973915687,
    149032870071564,
    152119989253391,
    153672147749041,
    310483437935526,
    318401816803182,
    328103103838738,
    338112122047343,
    348456926240395,
    359149876737581,
    370204061309428,
    381633126172831,
    393451305918636,
    405673441701786,
    418314971389630,
    431391241579500,
    444916140409445,
    458848041565805,
    473089050151122,
    482669366373865,
    487485542154934,
    984708768798580,
    1009266205008841,
    1039337347086124,
    1070338187352412,
    1102352586589425,
    1135416737634379,
    1169568911013157,
    1204848951019381,
    1241298358895293,
    1278960370451609,
    1317880007076803,
    1358104044548001,
    1399678937750328,
    1442646698295874,
    1486877423332971,
    1532067027797214,
    1562461138310709,
    1577738882160929,
    3186359819696184,
    3264225821567280,
    3359531103703879,
    3457715954222125,
    3559037752782277,
    3663605578587153,
    3771534642633915,
    3882944745597201,
    3997960511967796,
    4116711607014934,
    4239332876619591,
    4365964250096468,
    4496744560618985,
    4631799274994528,
    4770727675372666,
    4912596128143536,
    5007995812898881,
    5055942993011655,
    10208781070181753,
    10453043267410964,
    10751873139767811,
    11059518314467835,
    11376759350358675,
    11703920772595793,
    12041344951575315,
    12389387445169195,
    12748417651053851,
    13118819420877257,
    13500991688937964,
    13895348869815639,
    14302320551550824,
    14722332600201227,
    15155769652228762,
    15601367485469404,
    16056192492543400,
    16361984629545832,
    16515656777294873,
    33341796992525272,
    34124354395013021,
    35081342753590467,
    36065959796279730,
    37080631948406206,
    38126350873431525,
    39204161737718929,
    40315148801938769,
    41460437295339664,
    42641195169132917,
    43858634888142969,
    45114014542813885,
    46408636896192460,
    47743792319747210,
    49120645551873582,
    50535252009964374,
    51978495968644295,
    52948650877173094,
    53436136419328028,
    107856981607454636,
    110338442123416991,
    113371754444310536,
    116490696183757913,
    119702724304785874,
    123010831816362090,
    126418170051599051,
    129928004651265968,
    133543720872193799,
    137268828552560082,
    141106967288983787,
    145061911711060200,
    149137574700435332,
    153338004381029535,
    157667207440408708,
    162128798589834767,
    166710204179275661,
    171382471227544513,
    174522671248016151
];
module.exports = {
    digits: digits
}