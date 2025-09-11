import { cache } from "react";

// Motherboards (MOBO)
export const moboOptions = [
  {
    id: 1,
    Name: "ASUS Prime B660M-A",
    Price: 8740,
    Socket: "LGA1700",
    Chipset: "Intel B660",
    RamType: "DDR4",
    FormFactor: "Micro-ATX",
    RamSlots: 4,
    GpuSlots: 1,
    StorageSlots: 4,
    M2Slots: 2
},
{
    id: 2,
    Name: "MSI B550M PRO-VDH",
    Price: 5995,
    Socket: "AM4",
    Chipset: "AMD B550",
    RamType: "DDR4",
    FormFactor: "Micro-ATX",
    RamSlots: 4,
    GpuSlots: 1,
    StorageSlots: 4,
    M2Slots: 2
},
{
    id: 3,
    Name: "ASUS ROG Strix Z790-A WIFI II",
    Price: 18950,
    Socket: "LGA1700",
    Chipset: "Intel Z790",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 6,
    M2Slots: 4
},
{
    id: 4,
    Name: "Gigabyte X570 AORUS Elite",
    Price: 12400,
    Socket: "AM4",
    Chipset: "AMD X570",
    RamType: "DDR4",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 6,
    M2Slots: 2
},
{
    id: 5,
    Name: "ASRock B550 Phantom Gaming 4",
    Price: 7595,
    Socket: "AM4",
    Chipset: "AMD B550",
    RamType: "DDR4",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 1,
    StorageSlots: 4,
    M2Slots: 2
},
{
    id: 6,
    Name: "MSI X670-P PRO WIFI",
    Price: 20710,
    Socket: "AM5",
    Chipset: "AMD X670",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 6,
    M2Slots: 4
},
{
    id: 7,
    Name: "ASUS TUF Gaming B650M-PLUS",
    Price: 15450,
    Socket: "AM5",
    Chipset: "AMD B650",
    RamType: "DDR5",
    FormFactor: "Micro-ATX",
    RamSlots: 4,
    GpuSlots: 1,
    StorageSlots: 4,
    M2Slots: 2
},
{
    id: 8,
    Name: "MSI B650 Tomahawk WIFI",
    Price: 13995,
    Socket: "AM5",
    Chipset: "AMD B650",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 6,
    M2Slots: 3
},
{
    id: 9,
    Name: "ASUS PRIME B550M-K",
    Price: 4950,
    Socket: "AM4",
    Chipset: "AMD B550",
    RamType: "DDR4",
    FormFactor: "Micro-ATX",
    RamSlots: 2,
    GpuSlots: 1,
    StorageSlots: 2,
    M2Slots: 1
},
{
    id: 10,
    Name: "Gigabyte B660 DS3H AX",
    Price: 6895,
    Socket: "LGA1700",
    Chipset: "Intel B660",
    RamType: "DDR4",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 1,
    StorageSlots: 4,
    M2Slots: 2
},
{
    id: 11,
    Name: "MSI H610M PRO",
    Price: 4395,
    Socket: "LGA1700",
    Chipset: "Intel H610",
    RamType: "DDR4",
    FormFactor: "Micro-ATX",
    RamSlots: 2,
    GpuSlots: 1,
    StorageSlots: 2,
    M2Slots: 1
},
{
    id: 12,
    Name: "ASRock H610M-HDV",
    Price: 4650,
    Socket: "LGA1700",
    Chipset: "Intel H610",
    RamType: "DDR4",
    FormFactor: "Micro-ATX",
    RamSlots: 2,
    GpuSlots: 1,
    StorageSlots: 2,
    M2Slots: 1
},
{
    id: 13,
    Name: "Gigabyte B660M AORUS Pro",
    Price: 10990,
    Socket: "LGA1700",
    Chipset: "Intel B660",
    RamType: "DDR4",
    FormFactor: "Micro-ATX",
    RamSlots: 4,
    GpuSlots: 1,
    StorageSlots: 4,
    M2Slots: 2
},
{
    id: 14,
    Name: "MSI B760 Tomahawk WIFI",
    Price: 12395,
    Socket: "LGA1700",
    Chipset: "Intel B760",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 6,
    M2Slots: 3
},
{
    id: 15,
    Name: "ASUS PRIME B760M-A",
    Price: 8600,
    Socket: "LGA1700",
    Chipset: "Intel B760",
    RamType: "DDR5",
    FormFactor: "Micro-ATX",
    RamSlots: 4,
    GpuSlots: 1,
    StorageSlots: 4,
    M2Slots: 2
},
{
    id: 16,
    Name: "MSI Z790-A PRO WIFI",
    Price: 14295,
    Socket: "LGA1700",
    Chipset: "Intel Z790",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 6,
    M2Slots: 4
},
{
    id: 17,
    Name: "ASUS ROG Strix Z790-E Gaming WIFI",
    Price: 26950,
    Socket: "LGA1700",
    Chipset: "Intel Z790",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 3,
    StorageSlots: 4,
    M2Slots: 4
},
{
    id: 18,
    Name: "ASUS Z890 Hero",
    Price: 44950,
    Socket: "LGA1851",
    Chipset: "Intel Z890",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 4,
    M2Slots: 6
},
{
    id: 19,
    Name: "MSI Z790 GODLIKE",
    Price: 69000,
    Socket: "LGA1700",
    Chipset: "Intel Z790",
    RamType: "DDR5",
    FormFactor: "E-ATX",
    RamSlots: 4,
    GpuSlots: 3,
    StorageSlots: 8,
    M2Slots: 5
},
{
    id: 20,
    Name: "Gigabyte Z790 AORUS Master",
    Price: 37450,
    Socket: "LGA1700",
    Chipset: "Intel Z790",
    RamType: "DDR5",
    FormFactor: "ATX",
    RamSlots: 4,
    GpuSlots: 2,
    StorageSlots: 6,
    M2Slots: 4
},
{
  id: 21,
  Name: "ASUS PRIME H610M-R D4",
  Price: 4550,
  Socket: "LGA1700",
  Chipset: "Intel H610",
  RamType: "DDR4",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 4,
  M2Slots: 1
},
{
  id: 22,
  Name: "Gigabyte GA-H610M-K DDR4",
  Price: 4150,
  Socket: "LGA1700",
  Chipset: "Intel H610",
  RamType: "DDR4",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 4,
  M2Slots: 1
},
{
  id: 23,
  Name: "ASRock A520M-HVS",
  Price: 2995,
  Socket: "AM4",
  Chipset: "AMD A520",
  RamType: "DDR4",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 4,
  M2Slots: 0
},
{
  id: 24,
  Name: "Biostar A520MHP",
  Price: 2595,
  Socket: "AM4",
  Chipset: "AMD A520",
  RamType: "DDR4",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 4,
  M2Slots: 0
},
{
  id: 25,
  Name: "Gigabyte GA-B450M-DS3H V3",
  Price: 4150,
  Socket: "AM4",
  Chipset: "AMD B450",
  RamType: "DDR4",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 4,
  M2Slots: 1
},
{
  id: 26,
  Name: "Biostar H610MH",
  Price: 3720,
  Socket: "LGA1700",
  Chipset: "Intel H610",
  RamType: "DDR4",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 2,
  M2Slots: 1
},
{
  id: 27,
  Name: "Gigabyte A620M S2H",
  Price: 5500,
  Socket: "AM5",
  Chipset: "AMD A620",
  RamType: "DDR5",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 4,
  M2Slots: 1
},
{
  id: 28,
  Name: "ASRock H510M-HDV R2.0",
  Price: 3600,
  Socket: "LGA1200",
  Chipset: "Intel H510",
  RamType: "DDR4",
  FormFactor: "Micro-ATX",
  RamSlots: 2,
  GpuSlots: 1,
  StorageSlots: 4,
  M2Slots: 1
}


  
];

// Processors (CPU)
export const cpuOptions = [
  {
    id: 1,
    Name: "Intel Core i5-12400F",
    Price: 8990,
    Socket: "LGA1700",
    Cores: 6,
    Threads: 12,
    BaseClock: 2.50,
    BoostClock: 4.40,
    TDP: 65,
    MaxTDP: 253,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    Cache: 18,
  },
  {
    id: 2,
    Name: "AMD Ryzen 5 5600X",
    Price: 8990,
    Socket: "AM4",
    Cores: 6,
    Threads: 12,
    BaseClock: 3.70,
    BoostClock: 4.60,
    TDP: 65,
    RamType: "DDR4",
    RamMax: 3200,
    L1Cache: 384,
    L2Cache: 3,
    L3Cache: 32
  },
  {
    id: 3,
    Name: "Intel Core i7-13700K",
    Price: 19990,
    Socket: "LGA1700",
    Cores: 16,
    Threads: 24,
    BaseClock: "3.40GHz",
    BoostClock: "5.40GHz",
  TDP: 125,
  MaxTDP: 253,
    RamType: "DDR5 & DDR4",
    RamMax: 5600,
    Cache: 30,
  },
  {
    id: 4,
    Name: "AMD Ryzen 7 5800XT",
    Price: 15940,
    Socket: "AM4",
    Cores: 8,
    Threads: 16,
    BaseClock: "3.8GHz",
    BoostClock: "4.8GHz",
  TDP: 105,
    RamType: "DDR4",
    RamMax: 3200,
    L1Cache: 512,
    L2Cache: 4,
    L3Cache: 32
    
  },
  {
    id: 5,
    Name: "AMD Ryzen 7 5700X",
    Price: 10930,
    Socket: "AM4",
    Cores: 8,
    Threads: 16,
    BaseClock: 3.40,
    BoostClock: 4.60,
    TDP: 65,
    RamType: "DDR4",
    RamMax: 3200,
    L1Cache: 512,
    L2Cache: 4,
    L3Cache: 32
  },
  {
    id: 6,
    Name: "AMD Ryzen 7 7800X3D",
    Price: 27995,
    Socket: "AM5",
    Cores: 8,
    Threads: 16,
    BaseClock: 3.4,
    BoostClock: 5.0,
    TDP: 120,
    RamType: "DDR5",
    RamMax: 5200,
    L1Cache: 512,
    L2Cache: 8,
    L3Cache: 96
  },

    {
    id: 7,
    Name: "AMD Ryzen 5 7600X",
    Price: 14650,
    Socket: "AM5",
    Cores: 6,
    Threads: 12,
    BaseClock: 4.7,
    BoostClock: 5.3,
    TDP: 105,
    RamType: "DDR5",
    RamMax: 5200,
    L1Cache: 384,
    L2Cache: 6,
    L3Cache: 32
  },

    {
    id: 8,
    Name: "AMD Ryzen 5 9600X",
    Price: 17995,
    Socket: "AM5 ",
    Cores: 6,
    Threads: 12,
    BaseClock: 3.9,
    BoostClock: 5.4,
    TDP: 65,
    RamType: "DDR5",
    RamMax: 5600,
    L1Cache: 512,
    L2Cache: 8,
    L3Cache: 32
  },

    {
    id: 9,
    Name: "AMD Ryzen 5 5600G",
    Price: 6850,
    Socket: "AM4",
    Cores: 6,
    Threads: 12,
    BaseClock: 3.9,
    BoostClock: 4.4,
    TDP: 65,
    RamType: "DDR4",
    RamMax: 3200,
    L1Cache: 384,
    L2Cache: 6,
    L3Cache: 16
  },

    {
    id: 10,
    Name: "Intel Core i7-12700",
    Price: 13650,
    Socket: "LGA1700",
    Cores: 12,
    Threads: 20,
    BaseClock: 2.1,
    BoostClock: 4.9,
    TDP: 65,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    cache: 25,
  },

    {
    id: 11,
    Name: "Intel Core i3-14100",
    Price: 6995,
    Socket: "LGA1700",
    Cores: 4,
    Threads: 8,
    BaseClock: 3.5,
    BoostClock: 4.7,
    TDP: 60,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    cache: 12,
  },

    {
    id: 12,
    Name: "Intel Core i3-14100F",
    Price: 5295,
    Socket: "LGA1700",
    Cores: 4,
    Threads: 8,
    BaseClock: 3.5,
    BoostClock: 4.7,
    TDP: 60,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    cache: 12,
  },

    {
    id: 13,
    Name: "Intel Core i5-12600",
    Price: 14000,
    Socket: "LGA1700",
    Cores: 6,
    Threads: 12,
    BaseClock: 3.3,
    BoostClock: 4.8,
    TDP: 65,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    cache: 18,
  },

    {
    id: 14,
    Name: "Intel Core i5-13400F",
    Price: 7513,
    Socket: "LGA1700",
    Cores: 10,
    Threads: 16,
    BaseClock: 2.5,
    BoostClock: 4.6,
    TDP: 65,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    cache: 20,
  },

    {
    id: 15,
    Name: "Intel Core i5-14600K",
    Price: 14395,
    Socket: "LGA1700",
    Cores: 14,
    Threads: 20,
    BaseClock: 2.5,
    BoostClock: 4.8,
    TDP: 65,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    cache: 20,
  },

    {
    id: 16,
    Name: "Intel Core i5-14400F",
    Price: 8375,
    Socket: "LGA1700",
    Cores: 10,
    Threads: 16,
    BaseClock: 2.5,
    BoostClock: 4.6,
    TDP: 65,
    RamType: "DDR5 & DDR4",
    RamMax: 4800,
    cache: 20,
  },

    {
    id: 17,
    Name: "Intel Core i7-14700F",
    Price: 18226,
    Socket: "LGA1700",
    Cores: 20,
    Threads: 28,
    BaseClock: 2.1,
    BoostClock: 5.4,
    TDP: 65,
    RamType: "DDR5 & DDR4",
    RamMax: 5600,
    cache: 33,
  },

    {
    id: 18,
    Name: "Intel Core Ultra 7 Processor 265K",
    Price: 22750,
    Socket: "LGA1851",
    Cores: 20,
    Threads: 20,
    BaseClock: 3.9,
    BoostClock: 5.5,
    TDP: 125,
    RamType: "DDR5 & DDR4",
    RamMax: 6400,
    cache: 30,
  },

    {
    id: 19,
    Name: "Intel Core i9-14900KF",
    Price: 35950,
    Socket: "LGA1700",
    Cores: 24,
    Threads: 32,
    BaseClock: 3.2,
    BoostClock: 6.0,
    TDP: 125,
    RamType: "DDR5 & DDR4",
    RamMax: 5600,
    cache: 36,
  },

    {
    id: 20,
    Name: "Intel Core i9-14900K",
    Price: 31478,
    Socket: "LGA1700",
    Cores: 24,
    Threads: 32,
    BaseClock: 3.2,
    BoostClock: 6.0,
    TDP: 125,
    RamType: "DDR5 & DDR4",
    RamMax: 5600,
    cache: 36,
  }

  
];

export const gpuOptions = [
  {
  Id: 1,
  Name: "AMD Radeon RX 6500 XT",
  Price: 8400,
  Vram: "4GB GDDR6",
  PowerDraw: 107,
  ComputeUnits: 16,
  BoostFrequency: 2815
},
{
  Id: 2,
  Name: "NVIDIA GTX 1660 Super",
  Price: 12500,
  Vram: "6GB GDDR6",
  PowerDraw: 125,
  CudaCores: 1408,
  BoostFrequency: 1785
},
{
  Id: 3,
  Name: "AMD Radeon RX 6600",
  Price: 12495,
  Vram: "8GB GDDR6",
  PowerDraw: 132,
  ComputeUnits: 28,
  BoostFrequency: 2491
},
{
  Id: 4,
  Name: "NVIDIA RTX 3060",
  Price: 18895,
  Vram: "12GB GDDR6",
  PowerDraw: 170,
  CudaCores: 3584,
  BoostFrequency: 1780
},
{
  Id: 5,
  Name: "AMD Radeon RX 6700 XT",
  Price: 25500,
  Vram: "12GB GDDR6",
  PowerDraw: 230,
  ComputeUnits: 40,
  BoostFrequency: 2581
},
{
  Id: 6,
  Name: "NVIDIA RTX 3060 Ti",
  Price: 23950,
  Vram: "8GB GDDR6",
  PowerDraw: 200,
  CudaCores: 4864,
  BoostFrequency: 1670
},
{
  Id: 7,
  Name: "AMD Radeon RX 6750 XT",
  Price: 28900,
  Vram: "12GB GDDR6",
  PowerDraw: 250,
  ComputeUnits: 40,
  BoostFrequency: 2600
},
{
  Id: 8,
  Name: "NVIDIA RTX 3070",
  Price: 32500,
  Vram: "8GB GDDR6",
  PowerDraw: 220,
  CudaCores: 5888,
  BoostFrequency: 1725
},
{
  Id: 9,
  Name: "NVIDIA GTX 1650",
  Price: 8000,
  Vram: "4GB GDDR6",
  PowerDraw: 75,
  CudaCores: 896,
  BoostFrequency: 1665
},
{
  Id: 10,
  Name: "AMD Radeon RX 6500 XT",
  Price: 9500,
  Vram: "4GB GDDR6",
  PowerDraw: 107,
  ComputeUnits: 16,
  BoostFrequency: 2815
},
{
  Id: 11,
  Name: "NVIDIA RTX 3050 (6GB)",
  Price: 10250,
  Vram: "6GB GDDR6",
  PowerDraw: 130,
  CudaCores: 2304,
  BoostFrequency: 1470
},
{
  Id: 12,
  Name: "NVIDIA RTX 3050 (8GB)",
  Price: 13000,
  Vram: "8GB GDDR6",
  PowerDraw: 130,
  CudaCores: 2560,
  BoostFrequency: 1777
},
{
  Id: 13,
  Name: "NVIDIA GTX 1660 Super",
  Price: 11900,
  Vram: "6GB GDDR6",
  PowerDraw: 125,
  CudaCores: 1408,
  BoostFrequency: 1785
},
{
  Id: 14,
  Name: "NVIDIA RTX 2060 (12GB)",
  Price: 13000,
  Vram: "12GB GDDR6",
  PowerDraw: 160,
  CudaCores: 2176,
  BoostFrequency: 1680
},
{
  Id: 15,
  Name: "AMD Radeon RX 6600",
  Price: 13000,
  Vram: "8GB GDDR6",
  PowerDraw: 132,
  ComputeUnits: 28,
  BoostFrequency: 2491
},
{
  Id: 16,
  Name: "AMD Radeon RX 6600 XT",
  Price: 15500,
  Vram: "8GB GDDR6",
  PowerDraw: 160,
  ComputeUnits: 32,
  BoostFrequency: 2589
},
{
  Id: 17,
  Name: "NVIDIA RTX 3060 (12GB)",
  Price: 18000,
  Vram: "12GB GDDR6",
  PowerDraw: 170,
  CudaCores: 3584,
  BoostFrequency: 1780
},
{
  Id: 18,
  Name: "AMD Radeon RX 6650 XT",
  Price: 17000,
  Vram: "8GB GDDR6",
  PowerDraw: 180,
  ComputeUnits: 32,
  BoostFrequency: 2635
},
{
  Id: 19,
  Name: "Intel Arc A380",
  Price: 9550,
  Vram: "6GB GDDR6",
  PowerDraw: 75,
  XeCores: 8,
  BoostFrequency: 2450
},
{
  Id: 20,
  Name: "Intel Arc A580",
  Price: 10100,
  Vram: "8GB GDDR6",
  PowerDraw: 185,
  XeCores: 24,
  BoostFrequency: 2400
},
{
  Id: 21,
  Name: "Intel Arc A750",
  Price: 15500,
  Vram: "8GB GDDR6",
  PowerDraw: 225,
  XeCores: 28,
  BoostFrequency: 2400
},
{
  Id: 22,
  Name: "Intel Arc B580",
  Price: 17000,
  Vram: "12GB GDDR6",
  PowerDraw: 190,
  XeCores: 32,
  BoostFrequency: 2500
},
{
  Id: 23,
  Name: "Intel Arc A770 (8GB)",
  Price: 20000,
  Vram: "8GB GDDR6",
  PowerDraw: 225,
  XeCores: 32,
  BoostFrequency: 2400
},
{
  Id: 24,
  Name: "Gigabyte RTX 4090 Gaming OC",
  Price: 107895,
  Vram: "24GB GDDR6X",
  PowerDraw: 450,
  CudaCores: 16384,
  BoostFrequency: 2520
},
{
  Id: 25,
  Name: "MSI RTX 4090 Gaming X Trio",
  Price: 109995,
  Vram: "24GB GDDR6X",
  PowerDraw: 450,
  CudaCores: 16384,
  BoostFrequency: 2520
},
{
  Id: 26,
  Name: "Asus RTX 4090 TUF Gaming OC",
  Price: 121995,
  Vram: "24GB GDDR6X",
  PowerDraw: 450,
  CudaCores: 16384,
  BoostFrequency: 2565
},
{
  Id: 27,
  Name: "Inno3D RTX 4090 iChill X3",
  Price: 124999,
  Vram: "24GB GDDR6X",
  PowerDraw: 450,
  CudaCores: 16384,
  BoostFrequency: 2520
},
{
  Id: 28,
  Name: "Asus RTX 4090 Strix Gaming",
  Price: 134095,
  Vram: "24GB GDDR6X",
  PowerDraw: 450,
  CudaCores: 16384,
  BoostFrequency: 2610
},
{
  Id: 29,
  Name: "Asus RTX 4090 Strix LC",
  Price: 146800,
  Vram: "24GB GDDR6X",
  PowerDraw: 450,
  CudaCores: 16384,
  BoostFrequency: 2640
},
{
  Id: 30,
  Name: "Gigabyte RTX 4080 Eagle OC",
  Price: 82350,
  Vram: "16GB GDDR6X",
  PowerDraw: 320,
  CudaCores: 9728,
  BoostFrequency: 2505
},
{
  Id: 31,
  Name: "Asus RTX 4080 TUF Gaming OC",
  Price: 69995,
  Vram: "16GB GDDR6X",
  PowerDraw: 320,
  CudaCores: 9728,
  BoostFrequency: 2535
},
{
  Id: 32,
  Name: "Asus RTX 4080 Super Strix",
  Price: 96350,
  Vram: "16GB GDDR6X",
  PowerDraw: 320,
  CudaCores: 10240,
  BoostFrequency: 2550
},
{
  Id: 33,
  Name: "Asus RTX 4080 Super TUF Gaming OC",
  Price: 80975,
  Vram: "16GB GDDR6X",
  PowerDraw: 285,
  CudaCores: 10240,
  BoostFrequency: 2565
},
{
  Id: 34,
  Name: "Asus Radeon RX 7900 XT",
  Price: 62995,
  Vram: "20GB GDDR6",
  PowerDraw: 257,
  ComputeUnits: 84,
  BoostFrequency: 2500
},
{
  Id: 35,
  Name: "Inno3D RTX 5080 X3",
  Price: 73740,
  Vram: "16GB GDDR7",
  PowerDraw: 320,
  CudaCores: 10752,
  BoostFrequency: 2550
}


];

// Power Supplies (PSU)
export const psuOptions = [
  
{
  id: 1,
  name: "Corsair CV550",
  price: 2800,
  wattage: 550,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 2,
  name: "Seasonic S12III 650W",
  price: 3500,
  wattage: 650,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 3,
  name: "MSI MAG A650BN",
  price: 3100,
  wattage: 650,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 4,
  name: "Gigabyte GP-P550B",
  price: 2800,
  wattage: 550,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 5,
  name: "FSP HV Pro 650W",
  price: 2950,
  wattage: 650,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 6,
  name: "Cooler Master MWE 550 Bronze V2",
  price: 3000,
  wattage: 550,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 7,
  name: "Antec Atom B650",
  price: 3150,
  wattage: 650,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 8,
  name: "DeepCool PF600",
  price: 2700,
  wattage: 600,
  rating: "80+ (Standard)",
  modular: "Non-Modular"
},
{
  id: 9,
  name: "Thermaltake Smart 600W",
  price: 3300,
  wattage: 600,
  rating: "80+ (Standard)",
  modular: "Non-Modular"
},
{
  id: 10,
  name: "XPG Pylon 550",
  price: 3200,
  wattage: 550,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},

///////////////////////
{
  id: 11,
  name: "Corsair CX650",
  price: 3350,
  wattage: 650,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 12,
  name: "Corsair CX750",
  price: 3800,
  wattage: 750,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 13,
  name: "Cooler Master MWE Gold 650 V2",
  price: 4600,
  wattage: 650,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 14,
  name: "Cooler Master MWE Gold 750 V2",
  price: 5200,
  wattage: 750,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 15,
  name: "Gigabyte UD750GM",
  price: 5800,
  wattage: 750,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 16,
  name: "Gigabyte UD850GM",
  price: 6600,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 17,
  name: "MSI MAG A750GL PCIE5",
  price: 5200,
  wattage: 750,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 18,
  name: "ASUS TUF Gaming 650B",
  price: 3550,
  wattage: 650,
  rating: "80+ Bronze",
  modular: "Non-Modular"
},
{
  id: 19,
  name: "XPG Core Reactor 650",
  price: 5600,
  wattage: 650,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 20,
  name: "FSP Hydro GT Pro 750",
  price: 5900,
  wattage: 750,
  rating: "80+ Gold",
  modular: "Semi-Modular"
},
{
  id: 21,
  name: "Antec CSK750H",
  price: 4200,
  wattage: 750,
  rating: "80+ Bronze",
  modular: "Semi-Modular"
},
{
  id: 22,
  name: "Thermaltake Toughpower GX1 700",
  price: 5200,
  wattage: 700,
  rating: "80+ Gold",
  modular: "Non-Modular"
},

//////////////////////////////////
{
  id: 23,
  name: "Seasonic Focus GX-750",
  price: 6850,
  wattage: 750,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 24,
  name: "Seasonic Focus GX-850",
  price: 8200,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 25,
  name: "Corsair RM750e",
  price: 6950,
  wattage: 750,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 26,
  name: "Corsair RM850e",
  price: 8400,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 27,
  name: "Corsair RM850x Shift",
  price: 9900,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 28,
  name: "MSI MPG A850G PCIE5",
  price: 8800,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 29,
  name: "Cooler Master V850 SFX Gold",
  price: 7800,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 30,
  name: "Cooler Master V1000 Gold",
  price: 10500,
  wattage: 1000,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 31,
  name: "ASUS ROG Strix 850G Aura Edition",
  price: 9800,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 32,
  name: "EVGA SuperNOVA 850 G6",
  price: 9500,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 33,
  name: "Super Flower Leadex III Gold 750",
  price: 7800,
  wattage: 750,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 34,
  name: "be quiet! Pure Power 12 M 850W",
  price: 9200,
  wattage: 850,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 35,
  name: "Seasonic Vertex GX-1000 (PCIe 5)",
  price: 13500,
  wattage: 1000,
  rating: "80+ Gold",
  modular: "Fully Modular"
},
{
  id: 36,
  name: "Corsair HX1000i",
  price: 14900,
  wattage: 1000,
  rating: "80+ Platinum",
  modular: "Fully Modular"
}

  
];

// Memory (RAM)
export const ramOptions = [
  
  {
    id: 1,
    Name: "Kingston Fury Beast 8GB DDR4",
    Price: 1895,
    Type: "DDR4",
    Frequency: 3200,
    Capacity: "8GB"
  },
  {
    id: 2,
    Name: "Kingston Fury Beast 16GB DDR4",
    Price: 3095,
    Type: "DDR4",
    Frequency: 3200,
    Capacity: "16GB"
  },
  {
    id: 3,
    Name: "G.Skill Ripjaws V 16GB DDR4",
    Price: 2250,
    Type: "DDR4",
    Frequency: 3200,
    Capacity: "16GB"
  },
  {
    id: 4,
    Name: "AGI Gear 8GB DDR4",
    Price: 1495,
    Type: "DDR4",
    Frequency: 3200,
    Capacity: "8GB"
  },
  {
    id: 5,
    Name: "Corsair Vengeance 32GB DDR5",
    Price: 7995,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "32GB"
  },
  {
    id: 6,
    Name: "G.Skill Trident Z5 Neo RGB 32GB DDR5",
    Price: 8095,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "32GB"
  },
  {
    id: 7,
    Name: "TeamGroup T-Force Vulcan 16GB DDR5",
    Price: 2995,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "16GB"
  },
  {
    id: 8,
    Name: "Kingston Fury Renegade 32GB DDR5",
    Price: 7050,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "32GB"
  },
  {
    id: 9,
    Name: "Lexar Thor 32GB DDR5",
    Price: 5795,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "32GB"
  },
  {
    id: 10,
    Name: "Crucial 8GB DDR5",
    Price: 1595,
    Type: "DDR5",
    Frequency: 4800,
    Capacity: "8GB"
  },
  {
    id: 11,
    Name: "Kingston 16GB DDR4",
    Price: 2395,
    Type: "DDR4",
    Frequency: 2666,
    Capacity: "16GB"
  },
  {
    id: 12,
    Name: "Kingston Fury Beast RGB 16GB DDR4",
    Price: 3400,
    Type: "DDR4",
    Frequency: 3200,
    Capacity: "16GB"
  },
  {
    id: 13,
    Name: "Kingston 8GB DDR4 SODIMM",
    Price: 1795,
    Type: "DDR4",
    Frequency: 3200,
    Capacity: "8GB"
  },
  {
    id: 14,
    Name: "Corsair Vengeance LPX 16GB DDR4",
    Price: 2995,
    Type: "DDR4",
    Frequency: 3000,
    Capacity: "16GB"
  },
  {
    id: 15,
    Name: "G.Skill Trident Z RGB 16GB DDR4",
    Price: 3795,
    Type: "DDR4",
    Frequency: 3600,
    Capacity: "16GB"
  },
  {
    id: 16,
    Name: "TeamGroup Elite 8GB DDR4",
    Price: 1450,
    Type: "DDR4",
    Frequency: 2666,
    Capacity: "8GB"
  },
  {
    id: 17,
    Name: "ADATA XPG Spectrix D60G 16GB DDR4",
    Price: 3595,
    Type: "DDR4",
    Frequency: 3600,
    Capacity: "16GB"
  },
  {
    id: 18,
    Name: "Patriot Viper Steel 16GB DDR4",
    Price: 2895,
    Type: "DDR4",
    Frequency: 3200,
    Capacity: "16GB"
  },
  {
    id: 19,
    Name: "HyperX Fury 8GB DDR4",
    Price: 1300,
    Type: "DDR4",
    Frequency: 2666,
    Capacity: "8GB"
  },
  {
    id: 20,
    Name: "Corsair Dominator Platinum RGB 32GB DDR4",
    Price: 6595,
    Type: "DDR4",
    Frequency: 3600,
    Capacity: "32GB"
  },
  {
    id: 21,
    Name: "ADATA 8GB DDR5",
    Price: 1700,
    Type: "DDR5",
    Frequency: 4800,
    Capacity: "8GB"
  },
  {
    id: 22,
    Name: "Kingston 16GB DDR5",
    Price: 3000,
    Type: "DDR5",
    Frequency: 5600,
    Capacity: "16GB"
  },
  {
    id: 23,
    Name: "TeamGroup T-Force Delta RGB 16GB DDR5",
    Price: 7095,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "16GB"
  },
  {
    id: 24,
    Name: "TeamGroup T-Force Delta RGB 32GB DDR5",
    Price: 7095,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "32GB"
  },
  {
    id: 25,
    Name: "Kingston Fury Renegade 32GB DDR5",
    Price: 9000,
    Type: "DDR5",
    Frequency: 6400,
    Capacity: "32GB"
  },
  {
    id: 26,
    Name: "Crucial 32GB DDR5",
    Price: 4950,
    Type: "DDR5",
    Frequency: 4800,
    Capacity: "32GB"
  },
  {
    id: 27,
    Name: "G.Skill Ripjaws S5 16GB DDR5",
    Price: 4595,
    Type: "DDR5",
    Frequency: 5600,
    Capacity: "16GB"
  },
  {
    id: 28,
    Name: "Corsair Vengeance RGB 64GB DDR5",
    Price: 11995,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "64GB"
  },
  {
    id: 29,
    Name: "TeamGroup T-Force Vulcan 32GB DDR5",
    Price: 6095,
    Type: "DDR5",
    Frequency: 6000,
    Capacity: "32GB"
  },
  {
    id: 30,
    Name: "Transcend 32GB DDR5 SODIMM",
    Price: 4950,
    Type: "DDR5",
    Frequency: 4800,
    Capacity: "32GB"
  }

];

// Storage (2.5" SSD / HDD)
export const storageOptions = [
  {
    id: 1,
    Name: "Samsung 870 EVO 250GB",
    Price: 1950,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "250GB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 2,
    Name: "Samsung 870 EVO 500GB",
    Price: 2495,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "500GB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 3,
    Name: "Samsung 870 EVO 1TB",
    Price: 4195,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "1TB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 4,
    Name: "ADATA SU650 240GB",
    Price: 895,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "240GB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 5,
    Name: "ADATA SU800 512GB",
    Price: 3395,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "512GB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 6,
    Name: "Sandisk SSD Plus 240GB",
    Price: 1195,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "240GB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 7,
    Name: "Sandisk SSD Plus 480GB",
    Price: 1895,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "480GB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 8,
    Name: "Sandisk SSD Plus 1TB",
    Price: 3495,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "1TB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 9,
    Name: "PNY CS900 250GB",
    Price: 850,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "250GB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 10,
    Name: "WD Blue SA510 1TB",
    Price: 3875,
    Type: "SSD",
    Interface: "SATA",
    Capacity: "1TB",
    ReadWriteSpeeds: 550,
    Power: 10
  },
  {
    id: 11,
    Name: "WD Black Gaming HDD 1TB",
    Price: 4650,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "1TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 12,
    Name: "WD Black Gaming HDD 2TB",
    Price: 6950,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "2TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 13,
    Name: "WD Black Gaming HDD 4TB",
    Price: 9850,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "4TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 14,
    Name: "Seagate Barracuda 1TB",
    Price: 2150,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "1TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 15,
    Name: "Seagate Barracuda 2TB",
    Price: 2795,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "2TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 16,
    Name: "Seagate Barracuda 4TB",
    Price: 5095,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "4TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 17,
    Name: "Seagate SkyHawk Surveillance 1TB",
    Price: 2599,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "1TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 18,
    Name: "Seagate SkyHawk Surveillance 4TB",
    Price: 4600,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "4TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 19,
    Name: "Seagate SkyHawk Surveillance 6TB",
    Price: 8759,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "6TB",
    ReadWriteSpeeds: 150,
    Power: 10
  },
  {
    id: 20,
    Name: "Seagate SkyHawk Surveillance 10TB",
    Price: 18215,
    Type: "HDD",
    Interface: "SATA",
    Capacity: "10TB",
    ReadWriteSpeeds: 150,
    Power: 10
  }
];

// M.2 SSD
export const m2Options = [
  {
    id: 1,
    Name: "Gigabyte GP-GSM2NE3256GNTD (PCIe 3 NVMe)",
    Price: 1050,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 3)",
    Capacity: "256GB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 2,
    Name: "Gigabyte GEN3 2500E (PCIe 3 NVMe) 500GB",
    Price: 1595,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 3)",
    Capacity: "500GB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 3,
    Name: "Gigabyte GEN3 2500E (PCIe 3 NVMe) 1TB",
    Price: 2795,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 3)",
    Capacity: "1TB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 4,
    Name: "Gigabyte Aorus Gen4 5000E (PCIe 4 NVMe) 500GB",
    Price: 2450,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 4)",
    Capacity: "500GB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 5,
    Name: "Gigabyte Aorus Gen4 5000E (PCIe 4 NVMe) 1TB",
    Price: 3795,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 4)",
    Capacity: "1TB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 6,
    Name: "Kingston NV2 (PCIe 4 NVMe) 500GB",
    Price: 1650,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 4)",
    Capacity: "500GB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 7,
    Name: "Kingston NV2 (PCIe 4 NVMe) 1TB",
    Price: 2743,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 4)",
    Capacity: "1TB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 8,
    Name: "Kingston Fury Renegade (PCIe 4 NVMe) 500GB",
    Price: 3950,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 4)",
    Capacity: "500GB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 9,
    Name: "WD Blue SN570 (PCIe 3 NVMe) 500GB",
    Price: 2150,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 3)",
    Capacity: "500GB",
    ReadWriteSpeeds: 7000,
    Power: 10
  },
  {
    id: 10,
    Name: "WD Blue SN570 (PCIe 3 NVMe) 1TB",
    Price: 3995,
    Type: "NVMe SSD",
    Interface: "NVMe (PCIe 3)",
    Capacity: "1TB",
    ReadWriteSpeeds: 7000,
    Power: 10
  }

];

// Cases
export const caseOptions = [
  {
    Id: 1,
    Name: "DEEPCOOL CH160",
    Price: 3500,
    FormFactor: "Mini-ITX",
    Color: "Black/White"
  },
  {
    Id: 2,
    Name: "Fractal Design Torrent Nano",
    Price: 5800,
    FormFactor: "Mini-ITX",
    Color: "Black"
  },
  {
    Id: 3,
    Name: "JOYJOM Aluminum Mini-ITX Case",
    Price: 2800,
    FormFactor: "Mini-ITX",
    Color: "Silver"
  },
  {
    Id: 4,
    Name: "Galax Revolution 03",
    Price: 3200,
    FormFactor: "Mini-ITX",
    Color: "White"
  },
  {
    Id: 5,
    Name: "S300 Mini-ITX Case",
    Price: 4500,
    FormFactor: "Mini-ITX",
    Color: "Black"
  },
  {
    Id: 6,
    Name: "Rakk Mirad mATX Case",
    Price: 2500,
    FormFactor: "mATX",
    Color: "Black/White"
  },
  {
    Id: 7,
    Name: "Segotep Flexi 3",
    Price: 1500,
    FormFactor: "mATX",
    Color: "Black/White"
  },
  {
    Id: 8,
    Name: "Thermaltake Versa H13",
    Price: 2100,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 9,
    Name: "ASUS Prime AP201",
    Price: 3750,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 10,
    Name: "Lian Li O11 Dynamic Mini V2",
    Price: 7410,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 11,
    Name: "Jonsbo Z20",
    Price: 6446,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 12,
    Name: "darkFlash DK431",
    Price: 3450,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 13,
    Name: "Segotep Phoenix G5",
    Price: 3600,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 14,
    Name: "1STPLAYER GO6",
    Price: 1495,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 15,
    Name: "Armaggeddon Tron III Pro-Design",
    Price: 1299,
    FormFactor: "mATX",
    Color: "Black"
  },
  {
    Id: 16,
    Name: "NZXT H510",
    Price: 3200,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 17,
    Name: "Cooler Master MasterBox Q300L",
    Price: 3500,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 18,
    Name: "Corsair 4000D Airflow",
    Price: 4000,
    FormFactor: "ATX Mid Tower",
    Color: "White"
  },
  {
    Id: 19,
    Name: "Thermaltake V200",
    Price: 3200,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 20,
    Name: "MSI MAG VAMPIRIC 011",
    Price: 4500,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 21,
    Name: "Cougar MX330",
    Price: 2800,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 22,
    Name: "Antec NX210",
    Price: 2500,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 23,
    Name: "InWin 101",
    Price: 4000,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 24,
    Name: "Deepcool Matrexx 55",
    Price: 3000,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 25,
    Name: "Xigmatek Midgard 2",
    Price: 3500,
    FormFactor: "ATX Mid Tower",
    Color: "Black"
  },
  {
    Id: 26,
    Name: "ASUS ROG Hyperion GR701",
    Price: 22000,
    FormFactor: "E-ATX",
    Color: "Black"
  },
  {
    Id: 27,
    Name: "Cooler Master HAF 700",
    Price: 19700,
    FormFactor: "E-ATX",
    Color: "Black"
  },
  {
    Id: 28,
    Name: "Antec Dark Fleet DF-700 FLUX",
    Price: 10000,
    FormFactor: "E-ATX",
    Color: "Black"
  },
  {
    Id: 29,
    Name: "Fractal Design Meshify 2 XL",
    Price: 13500,
    FormFactor: "E-ATX",
    Color: "Black"
  },
  {
    Id: 30,
    Name: "NZXT H9 Flow",
    Price: 12000,
    FormFactor: "E-ATX",
    Color: "Black"
  }
];

// --- Normalize id/Name keys to lowercase `id` and `name` for all exported lists ---
// This runs at module load and keeps the original data but ensures consistent keys
const normalizeList = (list) => {
  if (!Array.isArray(list)) return;
  list.forEach(item => {
    // normalize id: prefer existing lowercase 'id', otherwise copy from 'Id' or 'ID'
    if (!Object.prototype.hasOwnProperty.call(item, 'id') && Object.prototype.hasOwnProperty.call(item, 'Id')) {
      item.id = item.Id;
      delete item.Id;
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'id') && Object.prototype.hasOwnProperty.call(item, 'ID')) {
      item.id = item.ID;
      delete item.ID;
    }
    // normalize name: prefer existing lowercase 'name', otherwise copy and lowercase from 'Name'
    if (!Object.prototype.hasOwnProperty.call(item, 'name') && Object.prototype.hasOwnProperty.call(item, 'Name')) {
      // preserve display casing from 'Name'
      item.name = String(item.Name);
      delete item.Name;
    } else if (!Object.prototype.hasOwnProperty.call(item, 'name') && Object.prototype.hasOwnProperty.call(item, 'name')) {
      item.name = String(item.name);
    } else if (Object.prototype.hasOwnProperty.call(item, 'Name')) {
      // fallback: preserve Name casing
      item.name = String(item.Name);
      delete item.Name;
    }
  });
};

// Apply normalization to all exported option lists
normalizeList(moboOptions);
normalizeList(cpuOptions);
normalizeList(gpuOptions);
normalizeList(psuOptions);
normalizeList(ramOptions);
normalizeList(storageOptions);
normalizeList(m2Options);
normalizeList(caseOptions);

// --- Helpers to normalize values for DB insertion ---
const parseFloatSafe = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const s = String(v).toLowerCase().replace(/ghz/g, '').trim();
  const m = s.match(/-?[0-9]+(\.[0-9]+)?/);
  return m ? parseFloat(m[0]) : null;
};

const parseIntSafe = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return Math.round(v);
  const s = String(v).toLowerCase();
  const m = s.match(/-?[0-9]+/);
  return m ? parseInt(m[0], 10) : null;
};

const parseWatt = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return Math.round(v);
  const s = String(v).toLowerCase();
  const m = s.match(/([0-9]+)\s*w/);
  if (m) return parseInt(m[1], 10);
  return parseIntSafe(s.replace(/w/gi, ''));
};

const parseGB = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return Math.round(v);
  const s = String(v).toLowerCase();
  const m = s.match(/([0-9]+)\s*g/);
  if (m) return parseInt(m[1], 10);
  const n = parseIntSafe(s.replace(/gb/gi, ''));
  return n;
};

// Build normalized rows ready for DB insertion
export const cpuRows = (cpuOptions || []).map(c => ({
  id: c.id || null,
  name: c.name || c.Name || null,
  price: parseIntSafe(c.Price || c.price),
  socket: c.Socket || c.socket || null,
  cores: parseIntSafe(c.Cores),
  threads: parseIntSafe(c.Threads),
  base_clock_ghz: parseFloatSafe(c.BaseClock),
  boost_clock_ghz: parseFloatSafe(c.BoostClock),
  tdp: parseWatt(c.TDP || c.Tdp || c.tdp),
  max_tdp: parseWatt(c.MaxTDP || c.MaxTDP || c.maxTDP),
  ram_type: c.RamType || c.ramType || null,
  ram_max: parseIntSafe(c.RamMax || c.RAMMax || c.ramMax),
  cache_mb: parseIntSafe(c.Cache || c.cache || c.L3Cache || c.L2Cache || c.L1Cache),
  raw: c
}));

export const gpuRows = (gpuOptions || []).map(g => ({
  id: g.id || g.Id || null,
  name: g.name || g.Name || null,
  price: parseIntSafe(g.Price || g.price),
  vram_gb: parseGB(g.Vram || g.VRAM || g.vram),
  power_draw_w: parseWatt(g.PowerDraw || g.Power || g.power),
  boost_freq_mhz: parseIntSafe(g.BoostFrequency || g.boostFrequency),
  cuda_cores: parseIntSafe(g.CudaCores || g.cudaCores),
  compute_units: parseIntSafe(g.ComputeUnits || g.computeUnits),
  xe_cores: parseIntSafe(g.XeCores || g.xeCores),
  raw: g
}));

export const psuRows = (psuOptions || []).map(p => ({
  id: p.id || null,
  name: p.name || p.Name || null,
  price: parseIntSafe(p.price || p.Price),
  wattage: parseWatt(p.wattage || p.Watt || p.Wattage),
  rating: p.rating || null,
  modular: p.modular || null,
  raw: p
}));

export const moboRows = (moboOptions || []).map(m => ({
  id: m.id || null,
  name: m.name || m.Name || null,
  price: parseIntSafe(m.Price || m.price),
  socket: m.Socket || m.socket || null,
  chipset: m.Chipset || m.chipset || null,
  form_factor: m.FormFactor || m.formFactor || null,
  ram_type: m.RamType || m.ramType || null,
  ram_slots: parseIntSafe(m.RamSlots || m.ramSlots),
  gpu_slots: parseIntSafe(m.GpuSlots || m.gpuSlots),
  storage_slots: parseIntSafe(m.StorageSlots || m.storageSlots),
  m2_slots: parseIntSafe(m.M2Slots || m.m2Slots),
  raw: m
}));

export const ramRows = (ramOptions || []).map(r => ({
  id: r.id || null,
  name: r.name || r.Name || null,
  price: parseIntSafe(r.Price || r.price),
  type: r.Type || r.type || null,
  frequency_mhz: parseIntSafe(r.Frequency || r.frequency),
  capacity_gb: parseGB(r.Capacity || r.capacity),
  raw: r
}));

export const storageRows = (storageOptions || []).map(s => ({
  id: s.id || null,
  name: s.name || s.Name || null,
  price: parseIntSafe(s.Price || s.price),
  type: s.Type || s.type || null,
  interface: s.Interface || s.interface || null,
  capacity_gb: parseGB(s.Capacity || s.capacity),
  power_w: parseWatt(s.Power || s.power),
  raw: s
}));

export const m2Rows = (m2Options || []).map(s => ({
  id: s.id || null,
  name: s.name || s.Name || null,
  price: parseIntSafe(s.Price || s.price),
  type: s.Type || s.type || null,
  interface: s.Interface || s.interface || null,
  capacity_gb: parseGB(s.Capacity || s.capacity),
  power_w: parseWatt(s.Power || s.power),
  raw: s
}));

export const caseRows = (caseOptions || []).map(c => ({
  id: c.id || null,
  name: c.name || c.Name || null,
  price: parseIntSafe(c.Price || c.price),
  form_factor: c.FormFactor || c.formFactor || null,
  color: c.Color || c.color || null,
  raw: c
}));

// Usage: import { cpuRows, gpuRows, psuRows } from './PCcomponentsDatabase.js' and bulk-insert into your MySQL tables.

