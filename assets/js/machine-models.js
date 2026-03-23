// machine-models.js — Model lists keyed by BigCommerce machine type category URL
// Used by My Machine picker to populate model dropdown instead of free-text input
// Empty arrays = no model list available for that category (text input fallback)
//
// BT_MODEL_ALIASES: when a customer saves a short code, also search these extras
// in FitsModel text so the green badge still appears on matching products.
window.BT_MODEL_ALIASES = {
  '580SE': ['580E'],   // 580 Super E — both forms appear in product data
  '680CK': ['680']     // 680 Construction King — sometimes listed as just "680"
};

window.BT_MODELS = {

  // ── CASE ──────────────────────────────────────────────────────────────────
  // Entries with {label, value} show a friendly name but store the short code
  // that appears in product FitsModel data. The "580 Super E" also matches "580E"
  // — both forms are stored in BT_MODEL_ALIASES below.
  '/c/case-construction-parts/case-backhoe-parts/': [
    '480B','480C','480CK','480D','480E','480F','530CK',
    '570LXT','570MXT','570N EP','570NXT','570ST','570SV',
    '580CK','580B','580C','580D','580EV','580K','580L','580M','580N','580N EP','580SR','580ST','580SV',
    {label:'580 Super D', value:'580SD'},
    {label:'580 Super E', value:'580SE'},
    {label:'580 Super K', value:'580SK'},
    {label:'580 Super L', value:'580SL'},
    {label:'580 Super M', value:'580SM'},
    {label:'580 Super N', value:'580SN'},
    '590SR','590ST',
    {label:'590 Turbo',   value:'590T'},
    {label:'590 Super L', value:'590SL'},
    {label:'590 Super M', value:'590SM'},
    {label:'590 Super N', value:'590SN'},
    '680CK','680B','680C','680D','680E','680G','680H','680K','680L',
    '780','780B','780C','780CK','780D','780H','780K'
  ],
  '/c/case-construction-parts/case-dozer-parts/': [
    '310','310B','310C','350','350B','350C',
    '450','450B','450C','450D','450E','455','455B','455C','455D',
    '550','550E','550G','550H',
    '650','650E','650G','650H','650K','650L','650M',
    '750','750H','750K','750L','750M',
    '850','850B','850C','850D','850E','850G','850H','850K','850L','850M',
    '1150','1150B','1150C','1150D','1150E','1150G','1150H','1150K','1150L','1150M',
    '1450','1450B','1550',
    '1650K','1650L','1650M',
    '1850','1850K',
    '2050','2050M'
  ],
  '/c/case-construction-parts/case-wheel-loader-parts/': [
    '21D','21E','21F','121E','121F','221D','221E','221F','321D','321E','321F','421G',
    '521','521D','521E','521F','521G',
    '621','621B','621C','621D','621E','621F','621G','651G',
    '721','721B','721C','721D','721E','721F','721G',
    '821','821B','821C','821D','821E','821F','821G',
    '921','921B','921C','921E','921F','921G',
    '1021F','1021G','1121F','1121G','1221E','1221F',
    'W7','W7E','W9','W9A','W9B','W9C','W9E',
    'W10','W10B','W10C','W10E','W11','W11B',
    'W14','W14B','W14C','W14H','W14FL',
    'W18','W18B','W20','W20B','W20C','W24B','W24C','W30','W36'
  ],
  '/c/case-construction-parts/case-skid-steer-loader-parts/': [
    '1816','1816B','1816C','1818','1825','1825B','1835','1835B','1835C','1838','1840','1845','1845B','1845C','1845S',
    '40XT','60XT','70XT','75XT','85XT','90XT','95XT',
    '410','420','430','435','440','445','465',
    'SR130','SR130B','SR150','SR160','SR160B','SR175','SR175B',
    'SR200','SR210','SR210B','SR220','SR240','SR240B','SR250','SR270','SR270B',
    'SV185','SV185B','SV250','SV250B','SV280','SV280B','SV300','SV300B','SV340','SV340B',
    'TR270','TR270B','TR310','TR310B','TR320','TR320B','TR340','TR340B',
    'TV380','TV380B','TV450','TV450B'
  ],
  '/c/case-industrial-parts/excavator-parts/': [
    '470B','880','880B','880C','880D','980','980B','1080B',
    '9007B','9010B','9020','9020B','9030','9030B','9040','9040B','9045B','9050B','9060B',
    'CX15EV','CX17C','CX26C','CX30C','CX37C','CX42D','CX50D','CX57C','CX60C','CX75C','CX80C',
    'CX130','CX130B','CX130C','CX130D','CX135','CX135B','CX140E','CX145C','CX145D',
    'CX160','CX160B','CX160C','CX160D','CX170E','CX180','CX190E',
    'CX210','CX210B','CX210C','CX210D','CX220E','CX225','CX230','CX235C',
    'CX240','CX240B','CX245D','CX250C','CX250D','CX260E',
    'CX290','CX290B','CX290D','CX300C','CX300D','CX300E',
    'CX330','CX350','CX350B','CX350C','CX350D','CX365E',
    'CX460','CX470B','CX470C','CX490D','CX500D',
    'CX700','CX700B','CX750D','CX800','CX800B',
    'WX95','WX125','WX140E','WX145','WX155E','WX160E','WX165','WX175E','WX185','WX210','WX210E','WX240'
  ],
  '/c/case-construction-parts/case-ih-tractor-parts/': [
    '100','105N','105U','105V','110A','115','115U','120','120A','125','125A','130','135','140','140A','145','148B','150','155','159','160','165','179','180','186','190','195','200','210','215','220','225','230','235','239','240','245','246','250','255','260','268','270','274','275','280','284','285','290','300','305','311B','315','320B','330','335','340','354','364','370','380','384','385','390','395','400','404','424','430','431','440','441','444','454','460','464','470','474','484','485','495','500','504','505','525','531','540','540C','541','541C','544','560','574','584','585','595','600','606','620','630','660','674','684','685','730','745','766','770','782','784','785','786','795','830','840','845','870','884','885','886','888','895','924','930','966','970','986','995',
    '1000','1030','1056','1066','1070','1086','1088','1090','1170','1175','1190','1194','1200','1255','1270','1290','1294','1310','1320','1370','1390','1394','1455','1466','1468','1470','1486','1490','1494','1500','1510','1520','1530','1566','1568','1570','1586','1594','1600','1620','1630','1690','1694','1700','1701','1710','1715','1718','1725','1800','1822','1844','1896','1900','1925','1981','1987','1993','1995',
    '2003','2022','2044','2090','2094','2096','2120','2130','2243','2290','2294','2390','2394','2470','2590','2594','2640','2670','2870',
    '3088','3210','3220','3230','3288','3294','3388','3394','3588','3594','3688','3788','3931',
    '4000','4010S','4030','4210','4220','4230','4240','4330V','4430','4490','4494','4568','4586','4690','4694','4786','4835','4890','4894','4994',
    '5000','5010S','5088','5120','5130','5140','5150','5220','5230','5240','5250','5288','5488','5530','5640',
    '6530','6590','6640',
    '7110','7120','7130','7140','7150','7210','7220','7230','7240','7250','7530','7740',
    '8186','8187','8217','8236','8237','8238','8260','8276','8296','8298','8300','8304','8305','8306','8339','8340','8341','8360','8560','8820','8825','8830','8840','8850','8910','8920','8930','8940','8950',
    '9110','9130','9170','9180','9210','9230','9250','9260','9270','9280','9310','9330','9350','9370','9380','9390',
    'MX80C','MX90C','MX100','MX100C','MX110','MX115','MX120','MXM120','MX125','MX130','MXM130','MX135','MX140','MXM140','MX150','MXM155','MX170','MXM175','MX180','MXM190','MX200','MX210','MX215','MX220','MX230','MX240','MX245','MX270','MX275','MX305',
    'Maxxum 100','Maxxum 110','Maxxum 115','Maxxum 120','Maxxum 125','Maxxum 130','Maxxum 135','Maxxum 140','Maxxum 145','Maxxum 150',
    'Magnum 215','Magnum 225','Magnum 235','Magnum 245','Magnum 250','Magnum 260','Magnum 275','Magnum 280','Magnum 290','Magnum 305','Magnum 310','Magnum 315','Magnum 335','Magnum 340','Magnum 370','Magnum 380',
    'Puma 115','Puma 125','Puma 130','Puma 140','Puma 145','Puma 150','Puma 155','Puma 160','Puma 165','Puma 180',
    'JX55','JX60','JX65','JX70','JX70U','JX75','JX80','JX80U','JX85','JX90','JX90U','JX95','JX100U',
    'JX1060C','JX1070C','JX1070N','JX1070U','JX1075C','JX1075N','JX1080U','JX1085C','JX1090U','JX1095C','JX1095N','JX1100U',
    'CVX130','CVX150'
  ],
  '/c/case-construction-parts/case-trencher-parts/': ['360','360B','360C','460','460B','460C','560','560B','560C','660','660B','660C','760','760B','760C','860','860B','860C','960','960B','960C','1060','1060B','1060C'],
  '/c/case-construction-parts/case-rough-terrain-forklift-parts/': ['584','584D','584E','585','585D','585E','586','586D','586E','586F','586G','586H','586K','588','588G','588H','588K'],
  '/c/case-articulated-dump-truck-parts/': ['300','300B','330','330B','335','335B','340','340B','410'],
  '/c/case-construction-parts/case-compactor-roller-parts/': ['1102','1102D','1102PD','570LXT','570MXT','854'],
  '/c/case-construction-parts/case-motor-grader-parts/': ['845','845B','845C','845D','865','865B','865C','865D','865E','885','885B','885C','885D','885E','885G','885H','885K','885L','885M','885N','885P'],
  '/c/case-construction-parts/case-telehandler/': ['686G','686G XR','688G','689G','TC1055','TX1055','TX742','TX842','TX945','TX130','TX130-30','TX130-33','TX130-40','TX130-43','TX130-45','TX140','TX140-43','TX140-45','TX170','TX170-45'],

  // ── JOHN DEERE ────────────────────────────────────────────────────────────
  '/c/john-deere-backhoe-parts/': ['210C','210E','210G','210K','210L','210LE','210LJ','300','300B','300D','300GLC','302A','310','310A','310B','310C','310D','310E','310G','310J','310K','310L','310SE','310SG','310SJ','310SK','310SL','315','315C','315D','315J','315SE','315SG','315SJ','315SK','315SL','320','325S','401B','401D','410','410B','410C','410D','410E','410G','410J','410K','410L','500','500C','510','510B','510C','510D','610B','610C','710B','710C','710D','710G','710J','710K'],
  '/c/john-deere-dozer-parts/': ['350','350B','350C','350D','350DLC','350GLC','355D','400','400G','400LC','420','420D','430','430D','440','450','450B','450C','450D','450DLC','450E','450G','450H','450J','450K','450LC','450P','455','455D','455E','455G','550','550A','550B','550E','550G','550H','550J','550K','555','555A','555B','555G','605C','650','650G','650H','650J','650K','655','655B','655C','655K','700','700H','700J','700K','700L','750','750B','750C','750H','750J','750K','750L','755','755A','755B','755C','755K','850','850B','850C','850D','850E','850G','850H','850J','850K','850L','950C','950E','950F','950G','950H','950K','1010','1050K','2010'],
  '/c/john-deere/excavator-parts-fits-john-deere-aftermarket/': ['17D','17G','27C','27D','27G','27ZTS','30','30G','35C','35D','35G','35ZTS','50','50C','50D','50G','50ZTS','60D','60G','70','70D','75C','75D','75G','80','80C','85','85D','85G','90E','110','120','120C','120D','130','130G','135C','135D','135G','160','160C','160D','160G','180C','180CW','180G','190E','190G','200','200C','200D','210D','210G','225C','225D','230','230C','230LCR','240D','250D','250G','270','270C','270D','290D','290G','300D','300G','330','330B','330C','350D','350G','370','370C','400','450','450C','450D','450H','470G','490','490D','490E','495D','550','590','590D','595','595D','600C','650D','690','690A','690B','690C','690D','690E','750C','790','790D','790E','792','792D','792E','850B','892','892D','892E','992D','992E'],
  '/c/john-deere-wheel-loader-parts/': ['204K','204L','244E','244H','244J','244K','244L','304H','304J','304K','304L','324H','324J','324K','344E','344G','344H','344J','344K','344L','444','444B','444C','444CH','444D','444E','444G','444H','444J','444K','444L','524K','524L','544','544A','544B','544C','544D','544E','544G','544H','544J','544K','624E','624G','624H','624J','624K','624P','644','644A','644B','644C','644E','644G','644H','644J','644K','724J','724K','744E','744H','744J','744K','824K','844','844J','844K','844L'],
  '/c/john-deere-forestry-parts/': ['340D','360D','360DC','440','440A','440B','440C','440D','460D','460DC','540','540A','540B','540D','540E','540G','540H','548E','548G','548H','560D','640','640D','640E','640G','640H','640L','643K','643L','648','648E','648G','648H','648L','740','740E','748E','748G','748H','748L','803HM','803MH','843L','848G','848H','848L','853M','948L'],
  '/c/john-deere-tractor-parts/': ['820','1010','1020','1030','1040','1052','1120','1354','1520','1640','1654','1830','2020','2040','2100','2140','2150','2155','2204','2250','2350','2355N','2510','2520','2630','2704','2854','2940','2950','2955','3004','3010','3020','3025D','3030','3110','3120','3640S','4000','4040','4050','4050E','4055','4120','4240','4250','4320','4430','4450','4555','4630','5000','5045E','5055E','5060E','5065M','5070M','5076E','5080R','5083E','5085E','5085M','5090R','5103','5105M','5200','5220','5225','5300','5403','5410','5415','5425','6010','6020','6090MC','6100','6100D','6100J','6105','6105M','6110','6140R','6145R','6175R','6400SP','6430','7185J','7200','7200R','7600','7610','7700','7710','7810','8100','8120','8130','9100','9330'],
  '/c/john-deere-skid-steer-parts/': ['240','250','250D','260','270','280','313','315','317','317G','318D','318E','318G','319D','319E','320','320D','320E','320G','323D','323E','325','325G','326D','326E','328E','329D','329E','330G','331G','332','332D','332E','332G','333D','333E','333G','4475','5575','6675','7775','8875'],
  '/c/john-deere-motor-grader-parts/': ['570','570A','570B','620','620G','670','670A','670B','670C','670D','670G','670GP','672A','762','770','770A','770B','770C','770D','772CH','872D','872GP'],
  '/c/john-deere-articulated-dump-truck-parts/': ['250C','250D','300D','370E','410D','410E'],
  '/c/john-deere-telehandler-parts/': ['3200','3400','3800'],
  '/c/john-deere-scraper-parts/': ['760A','762','762B','840','860B','862','862B'],

  // ── FORD / NEW HOLLAND ────────────────────────────────────────────────────
  '/c/ford-new-holland-backhoe-parts/': ['230A','231','233','234','250C','260C','333','334','335','340','340A','340B','445','445A','445C','445D','455','455C','455D','515','530A','531','532','535','540','540A','540B','545','545A','545C','545D','550','555','555A','555B','555C','555D','575D','575E','655','655A','655C','655D','655E','675D','675E','750','755','755A','755B'],
  '/c/ford-tractor-early/': ['2N','8N','9N','NAA','Jubilee','501','601','701','801','901','2000','4000'],
  '/c/ford-new-holland-tractor/': ['2000','2100','2110','2600','2610','2810','2910','3000','3100','3110','3600','3610','3910','4000','4100','4110','4600','4610','4630','5000','5100','5600','5610','5900','6600','6610','6700','6710','7000','7100','7200','7600','7610','7700','7710','7740','7840','8000','8210','8240','8340','TW5','TW10','TW15','TW20','TW25','TW30','TW35'],
  '/c/ford-compact-tractor/': [],
  '/c/ford-new-holland-parts/ford-new-holland-skid-steer-parts/': [],
  '/c/ford-new-holland-parts/telehandler/': [],
  '/c/ford-new-holland-parts/new-holland-excavator/': [],
  '/c/ford-new-holland-parts/new-holland-dozer/': [],
  '/c/ford-new-holland-parts/new-holland-wheel-loader/': [],
  '/c/ford-new-holland-parts/new-holland-motor-grader/': [],

  // ── CATERPILLAR ───────────────────────────────────────────────────────────
  '/c/cat-backhoe-parts/': ['416','416B','416C','416D','416E','416F','420','420D','420E','420F','420F2','424B','424D','428B','428C','428D','428E','428F','430D','430E','430F','432D','432E','432F','434E','434F','442D','442E','444E','444F','446B','446D'],
  '/c/cat-dozer-parts/': ['D3','D3B','D3C','D3G','D3K','D4','D4B','D4C','D4D','D4E','D4G','D4H','D4K','D5','D5B','D5C','D5G','D5H','D5K','D5M','D5N','D6','D6B','D6C','D6D','D6G','D6H','D6K','D6M','D6N','D6R','D6T','D7','D7E','D7F','D7G','D7H','D7R','D8','D8H','D8K','D8L','D8N','D8R','D8T','D9','D9G','D9H','D9L','D9N','D9R','D9T','D10','D10N','D10R','D10T','D11','D11N','D11R','D11T'],
  '/c/caterpillar-industrial-parts/cat-excavator-parts/': ['301.5','301.7','302','302.5','303','303.5','304','305','305.5','306','307','308','309','311','312','312B','312C','312D','313','314','315','315B','315C','315D','316','317','318','318D2','319','320','320B','320C','320D','320E','321','322','323','323D2','324','325','325B','325C','325D','326','328','329','329D2','330','330B','330C','330D','336','336D2','340','345','345B','345C','345D','349','349D2','350','352','365','374','390'],
  '/c/cat-wheel-loader-parts/': [],
  '/c/cat-telehandler-parts/': [],
  '/c/cat-motor-grader-parts/': [],
  '/c/cat-dump-truck-parts/': [],
  '/c/cat-skid-steer-parts/': [],
  '/c/caterpillar-scraper-parts/': [],
  '/c/caterpillar-industrial-parts/caterpillar-model-spotlight-and-specs/': [],

  // ── DRESSER / IH ──────────────────────────────────────────────────────────
  '/c/dresser-gallion-parts/ih-dresser-dozer-parts/': ['TD5','TD6','TD7','TD7C','TD7E','TD7G','TD7H','TD8','TD8C','TD8E','TD8G','TD8H','TD9','TD9B','TD9H','TD10','TD12','TD12B','TD14','TD14A','TD15','TD15B','TD15C','TD15E','TD15M','TD20','TD20C','TD20E','TD20H','TD25','TD25B','TD25C','TD25E','TD25M'],
  '/c/dresser-gallion-parts/dresser-galion-grader/': [],

  // ── KING KUTTER ───────────────────────────────────────────────────────────
  '/c/king-kutter-finish-mower-parts/': ['FM-48','FM-60','FM-72','RFM-48','RFM-60','RFM-72','RSFM-72'],
  '/c/king-kutter-rotary-cutter-replacement-parts/': ['L-48','L-60','L-72','L-84','L-96'],
  '/c/king-kutter-parts/rotary-tiller/': ['TG-48','TG-54','TG-60','TG-72'],
  '/c/king-kutter-parts/king-kutter-angle-frame-discs/': [],
  '/c/king-kutter-parts/box-frame-discs/': [],
  '/c/king-kutter-parts/king-kutter-box/': [],
  '/c/king-kutter-parts/king-kutter-rear-blade/': [],
  '/c/king-kutter-dual-edge-land-graders/': [],
  '/c/king-kutter/dirt-scoop-parts': [],
  '/c/king-kutter-parts/king-kutter-atv/': [],
  '/c/king-kutter-yard-rake-parts/': [],
  '/c/king-kutter-seeder-spreader-parts/': [],
  '/c/king-kutter-parts/king-kutter-post-hole-digger/': [],
  '/c/king-kutter-parts/king-kutter-middle-buster-subsoiler/': [],
  '/c/king-kutter-parts/king-kutter-3-point-kultipacker/': [],
  '/c/king-kutter-parts/king-kutter-arena-renovator/': [],
  '/c/king-kutter-parts/king-kutter-bale-spear/': [],
  '/c/king-kutter-parts/king-kutter-cultivator/': [],
  '/c/king-kutter-parts/king-kutter-disc-bedder/': [],
  '/c/king-kutter-pto-drive-shafts/': [],
  '/c/king-kutter-parts/king-kutter-mower-or-tiller-gearbox/': [],

  // ── KUBOTA ────────────────────────────────────────────────────────────────
  '/c/kubota-parts/kubota-tractor/': ['B1550','B1700','B1750','B2100','B2150','B2400','B2630','B2710','B2920','B3030','B3200','B3300','B3350','B5100','B6100','B7100','B7200','B7300','B7400','B7500','B7510','B7610','B8200','B9200','L175','L185','L200','L210','L225','L235','L245','L260','L275','L285','L295','L305','L345','L355','L2250','L2350','L2500','L2550','L2600','L2650','L2800','L2900','L2950','L3000','L3010','L3130','L3200','L3250','L3300','L3350','L3400','L3430','L3450','L3540','L3560','L3600','L3710','L3750','L3800','L3830','L3840','L3940','L4060','L4200','L4240','L4300','L4330','L4400','L4600','L4610','L4630','L4740','L4760','L5030','L5040','L5060','L5240','L5460','L5740','M4500','M4950','M5030','M5400','M5640','M6800','M7030','M7040','M7060','M7500','M8030','M8200','M8540','M9000','M9540'],
  '/c/kubota-parts/kubota-excavator/': ['KX015','KX018','KX033','KX040','KX057','KX080','KX121','KX161','KX191','U15','U17','U25','U35','U48','U55'],
  '/c/kubota-parts/kubota-skid-steer-loaders/': ['SSV65','SSV75','SVL65','SVL75','SVL90','SVL95','SVL97','R420','R520','R530','R630'],
  '/c/kubota-parts/kubota-utv/': ['RTV400','RTV500','RTV900','RTV1100','RTV1140','RTV-X900','RTV-X1100','RTV-X1120'],
  '/c/kubota-parts/kubota-wheel-loader/': ['R420','R520','R530','R630'],
  '/c/kubota-parts/kubota-backhoe/': [],

  // ── KOBELCO ───────────────────────────────────────────────────────────────
  '/c/kobelco-parts/kobelco-instruments-and-controls/': [],
  '/c/kobelco/kobelco-excavator-pins-bushings-links/': [],
  '/c/kobelco/kobelco-excavator-hydraulic-cylinder/': [],
  '/c/kobelco/kobelco-excavator-dipper-stick/': [],
  '/c/kobelco/kobelco-excavator-muffler/': [],
  '/c/kobelco/kobelco-excavator-hydraulic-pump-coupler/': [],
  '/c/kobelco/kobelco-excavator-hydraulic-pump/': [],
  '/c/kobelco/kobelco-excavator-cab-glass/': [],
  '/c/kobelco-excavator-ac-heater-parts/': [],
  '/c/kobelco-parts/kobelco-excavator-undercarriage-steel-tracks/': [],
  '/c/kobelco-parts/kobelco-undercarriage-rubber-tracks/': [],
  '/c/kobelco/kobelco-excavator-final-drive/': [],
  '/c/kobelco-parts/kobelco-excavator-cab-parts/kobelco-excavator-seats/': [],
  '/c/kobelco/kobelco-excavator-oil-cooler-and-radiator/': [],
  '/c/kobelco/kobelco-excavator-hydraulic-control-valve/': [],
  '/c/kobelco/kobelco-excavator-swing-bearing/': [],
  '/c/kobelco/kobelco-excavator-swing-motor/': [],
  '/c/kobelco/kobelco-excavator-engine/': [],
  '/c/kobelco/kobelco-excavator-fuel-cap/': [],
  '/c/kobelco/kobelco-excavator-specs/': [],

  // ── KOMATSU ───────────────────────────────────────────────────────────────
  '/c/komatsu/komatsu-excavator/': ['PC10','PC15','PC20','PC25','PC30','PC35','PC40','PC45','PC50','PC55','PC60','PC70','PC75','PC78','PC88','PC100','PC110','PC120','PC130','PC138','PC160','PC180','PC200','PC210','PC220','PC228','PC240','PC270','PC290','PC300','PC340','PC350','PC360','PC400','PC450','PC490','PC600','PC650','PC750','PC800'],
  '/c/komatsu/komatsu-dozer/': ['D20','D21','D31','D37','D39','D41','D50','D51','D53','D57','D58','D60','D61','D65','D80','D85','D87','D135','D150','D155','D275','D355','D375','D475'],
  '/c/komatsu/komatsu-wheel-loader/': ['WA20','WA30','WA40','WA50','WA55','WA65','WA70','WA80','WA90','WA100','WA115','WA120','WA150','WA180','WA200','WA250','WA270','WA300','WA320','WA350','WA380','WA400','WA420','WA430','WA450','WA470','WA480','WA500','WA600','WA700','WA800','WA900'],
  '/c/komatsu/komatsu-backhoe-parts/': [],
  '/c/komatsu/komatsu-articulated-dump-trucks/': [],
  '/c/komatsu/komatsu-skid-steer-track-loader/': [],
  '/c/komatsu/komatsu-grader/': [],

  // ── LONG ──────────────────────────────────────────────────────────────────
  '/c/long-tractor-parts/long-tractor-specs/': [],
  '/c/long-tractor-filters/': [],
  '/c/long-tractor-parts/long-tractor-engine-and-engine-parts/': [],
  '/c/long-tractor-parts/long-tractor-steering-parts/': [],
  '/c/long-tractor-parts/long-tractor-front-axle-parts/': [],
  '/c/long-tractor-parts/long-tractor-hydraulic-parts/': [],
  '/c/long-tractor-parts/long-tractor-fuel-system-parts/': [],
  '/c/long-tractor-parts/long-tractor-three-point-hitch-and-drawbar/': [],
  '/c/long-tractor-parts/long-tractor-electrical-parts/': [],
  '/c/long-tractor-parts/long-tractor-transmission-parts/': [],
  '/c/long-tractor-parts/long-tractor-sheet-metal/': [],
  '/c/long-tractor-parts/long-tractor-seats/': [],
  '/c/long-tractor-parts/long-tractor-hydraulic-pump/': [],
  '/c/long-tractor-parts/long-tractor-muffler/': [],
  '/c/long-tractor-parts/long-tractor-radiator/': [],
  '/c/long-tractor-parts/long-tractor-rear-end-and-differential-parts/': [],
  '/c/long-tractor-parts/long-tractor-water-pump/': [],
  '/c/long-tractor-parts/long-tractor-brake-parts/': [],
  '/c/long-tractor-parts/long-tractor-clutch-and-pressure-plate/': [],
  '/c/long-tractor-parts/long-tractor-bumper-brush-guard/': [],

  // ── BOBCAT ────────────────────────────────────────────────────────────────
  '/c/bobcat-replacement-parts/bobcat-skid-steer-and-track-loaders/': [],
  '/c/bobcat-replacement-parts/bobcat-mini-excavator-parts/': [],
  '/c/bobcat/bobcat-backhoe-and-utility-tractor/': [],

  // ── JCB ───────────────────────────────────────────────────────────────────
  '/c/jcb/jcb-backhoe-parts/': [],
  '/c/jcb/jcb-excavator-parts/': [],
  '/c/jcb/jcb-fastrac-parts/': [],
  '/c/jcb/jcb-rough-terrain-forklift-parts/': [],
  '/c/jcb/jcb-skid-steer-and-teletruck/': [],
  '/c/jcb/jcb-wheel-loader-parts/': [],
  '/c/jcb/loadall-telehandler-parts/': [],

  // ── HITACHI ───────────────────────────────────────────────────────────────
  '/c/hitachi-parts/hitachi-excavator-cab-parts/hitachi-excavator-seats/': [],
  '/c/hitachi/hitachi-track-recoil-and-spring-adjusters/': [],
  '/c/hitachi/hitachi-hydraulic-oil-cooler/': [],
  '/c/hitachi/hitachi-radiator/': [],
  '/c/hitachi/hitachi-pins-and-bushings/': [],
  '/c/hitachi/hitachi-hydraulic-pump-coupler/': [],
  '/c/hitachi/hitachi-muffler/': [],
  '/c/hitachi/hitachi-rubber-tracks/': [],
  '/c/hitachi/hitachi-steel-tracks/': [],
  '/c/hitachi/hitachi-final-drive/': [],
  '/c/hitachi/hitachi-cab-glass/': [],
  '/c/hitachi-parts/hitachi-excavator-controllers-and-monitors/': [],
  '/c/hitachi/hitachi-swing-bearing/': [],
  '/c/hitachi-excavator-swing-gearbox-planetary-parts/': [],
  '/c/hitachi-parts/hitachi-ignition-switches/': [],
  '/c/hitachi/hitachi-wiper-blades/': [],
  '/c/hitachi/hitachi-engine-parts/': [],
  '/c/hitachi/hitachi-hydraulic-cylinders/': [],
  '/c/hitachi/hitachi-water-pump/': [],
  '/c/hitachi/hitachi-hydraulic-pump/': [],
  '/c/hitachi/hitachi-sheet-metal/': [],
  '/c/hitachi/hitachi-model-specs/': [],

  // ── HYUNDAI ───────────────────────────────────────────────────────────────
  '/c/hyundai-parts/hyundai-excavator-hydraulic-cylinder/': [],
  '/c/hyundai/hyundai-seat/': [],
  '/c/hyundai/hydraulic-pump/': [],
  '/c/hyundai/hyundai-final-drive/': [],
  '/c/hyundai/hyundai-hydraulic-cylinder-seal-kits/': [],
  '/c/hyundai/hyundai-radiator-and-oil-cooler/': [],
  '/c/hyundai/hyundai-rubber-tracks/': [],
  '/c/hyundai/swing-motor/': [],
  '/c/hyundai/hyundai-engine-parts/': [],
  '/c/hyundai/hyundai-excavator-specs/': [],

  // ── VOLVO ─────────────────────────────────────────────────────────────────
  '/c/volvo/excavator/': ['EC13','EC15','EC20','EC25','EC27','EC30','EC35','EC45','EC55','EC60','EC70','EC80','EC95','EC100','EC110','EC120','EC130','EC140','EC160','EC180','EC200','EC210','EC220','EC235','EC240','EC250','EC290','EC300','EC330','EC340','EC360','EC380','EC460','EC480','EC700'],
  '/c/volvo-backhoe/': [],
  '/c/volvo/volvo-wheel-loader/': ['L20','L25','L30','L35','L45','L50','L60','L70','L90','L105','L110','L120','L150','L180','L220','L260','L330','L350'],
  '/c/volvo/volvo-articulated-dump-truck/': [],
  '/c/volvo/volvo-skid-steer-and-track-loader/': [],
  '/c/volvo-compactor-roller-parts/': [],

  // ── TAKEUCHI ──────────────────────────────────────────────────────────────
  '/c/takeuchi/takeuchi-excavator-parts/': [],
  '/c/takeuchi/takeuchi-skid-steer-loader-parts/': [],

  // ── DOOSAN ────────────────────────────────────────────────────────────────
  '/c/doosan/doosan-final-drive/': [],
  '/c/doosan/doosan-main-hydraulic-pump/': [],
  '/c/doosan/doosan-rubber-tracks/': [],
  '/c/doosan/doosan-swing-bearing/': [],
  '/c/doosan/doosan-swing-motor/': [],
  '/c/doosan/doosan-cooling/': [],

  // ── DAEWOO ────────────────────────────────────────────────────────────────
  '/c/daewoo-parts/daewoo-filters/': [],
  '/c/daewoo/daewoo-final-drive/': [],
  '/c/daewoo/daewoo-main-hydraulic-pump/': [],
  '/c/daewoo/daewoo-swing-bearings/': [],
  '/c/daewoo/daewoo-swing-motor/': [],
  '/c/daewoo/daewoo-model-specifications/': [],

  // ── SAMSUNG ───────────────────────────────────────────────────────────────
  '/c/samsung/samsung-final-drive/': [],
  '/c/samsung-parts/samsung-hydraulic-cylinder/': [],
  '/c/samsung/samsung-hydraulic-pump/': [],
  '/c/samsung/samsung-swing-bearing/': [],
  '/c/samsung/samsung-swing-motor/': [],

  // ── YANMAR ────────────────────────────────────────────────────────────────
  '/c/yanmar/yanmar-skid-steer-track-loader-parts/': [],
  '/c/yanmar/yanmar-mini-excavator-parts/': [],

  // ── LINK-BELT ─────────────────────────────────────────────────────────────
  '/c/linkbelt/linkbelt-excavator/': [],

  // ── IHI ───────────────────────────────────────────────────────────────────
  '/c/ihi/ihi-skid-steer-and-compact-track-loader-parts/': [],
  '/c/ihi-excavator-parts/': [],

  // ── JLG ───────────────────────────────────────────────────────────────────
  '/c/jlg/jlg-aerial-lift-parts/': [],

  // ── GENIE ─────────────────────────────────────────────────────────────────
  '/c/genie/genie-telehandler/': [],

  // ── WACKER NEUSON ─────────────────────────────────────────────────────────
  '/c/wacker-neuson/wacker-neuson-mini-excavator-parts/': [],
  '/c/wacker-neuson/wacker-neuson-skid-steer-track-loader-parts/': [],

  // ── GEHL ──────────────────────────────────────────────────────────────────
  '/c/gehl-parts/gehl-door-glass/': [],
  '/c/gehl/gehl-filters/': [],
  '/c/gehl/gehl-final-drive/': [],
  '/c/gehl-parts/gehl-rubber-tracks-undercarriage/': [],
  '/c/gehl-parts/gehl-seats/': [],

  // ── DITCH WITCH ───────────────────────────────────────────────────────────
  '/c/ditchwitch/ditch-witch-engine-parts/': [],
  '/c/ditchwitch/ditch-witch-final-drive/': [],
  '/c/ditchwitch/ditch-witch-tracks-and-undercarriage/': [],

  // ── HYSTER ────────────────────────────────────────────────────────────────
  '/c/hyster/hyster-radiator/': [],

  // ── HANIX ─────────────────────────────────────────────────────────────────
  '/c/hanix-parts/hanix-excavator-swing-bearing/': [],
  '/c/hanix/hanix-final-drives/': [],

  // ── KOEHRING ──────────────────────────────────────────────────────────────
  '/c/koehring/koehring-final-drive/': [],

  // ── LIEBHERR ──────────────────────────────────────────────────────────────
  '/c/liebherr/liebherr-excavator-swing-bearing/': [],

  // ── MITSUBISHI ────────────────────────────────────────────────────────────
  '/c/mitsubishi/mitsubishi-excavator-final-drive/': [],
  '/c/mitsubishi/mitsubishi-excavator-swing-bearing/': [],

  // ── SUMITOMO ──────────────────────────────────────────────────────────────
  '/c/sumitomo/sumitomo-excavator-swing-bearing/': [],
  '/c/sumitomo/sumitomo-final-drive/': [],

  // ── TIMBERJACK ────────────────────────────────────────────────────────────
  '/c/timberjack-parts/timberjack-air-conditioning-and-heating/': [],
  '/c/timberjack/timberjack-cylinder-seal-kits/': [],
  '/c/timberjack-parts/timberjack-drive-shafts/': [],
  '/c/timberjack/timberjack-hydraulic-pumps-and-motors/': [],
  '/c/timberjack/timberjack-swing-bearing/': [],

  // ── TIGERCAT ──────────────────────────────────────────────────────────────
  '/c/tigercat-no-category/tigercat-feller-bunchers-and-log-skidders/': [],
  '/c/tigercat-no-category/tigercat-feller-bunchers-and-log-skidders/tigercat-skidder-specs/': []

};
