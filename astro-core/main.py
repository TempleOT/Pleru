from fastapi import FastAPI
from pydantic import BaseModel, Field
import swisseph as swe
import os
from typing import Dict, List, Tuple

app = FastAPI(title="astro-core")

# ──────────────────────────────────────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────────────────────────────────────
class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: float = Field(..., description="UTC decimal hours, e.g. 21.5 for 21:30 UTC")
    lat: float      # +N, -S
    lon: float      # +E, -W  (West is negative, e.g. California)
    house_system: str = "P"  # Placidus

# ──────────────────────────────────────────────────────────────────────────────
# Constants / helpers
# ──────────────────────────────────────────────────────────────────────────────
PLANETS = {
    "SUN": swe.SUN, "MOON": swe.MOON, "MERCURY": swe.MERCURY, "VENUS": swe.VENUS,
    "MARS": swe.MARS, "JUPITER": swe.JUPITER, "SATURN": swe.SATURN,
    "URANUS": swe.URANUS, "NEPTUNE": swe.NEPTUNE, "PLUTO": swe.PLUTO,
}
ZODIAC = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
]
ASPECT_ANGLES = {"conjunction":0.0,"sextile":60.0,"square":90.0,"trine":120.0,"opposition":180.0}
ASPECT_ORB_DEG = 6.0
FLAG = swe.FLG_SWIEPH | swe.FLG_SPEED  # Swiss ephemeris + include speeds

def norm360(x: float) -> float:
    x = x % 360.0
    return x if x >= 0 else x + 360.0

def angle_diff(a: float, b: float) -> float:
    d = abs(norm360(a) - norm360(b))
    return d if d <= 180.0 else 360.0 - d

def sign_from_lon(lon: float) -> Tuple[str, float]:
    lon = norm360(lon)
    sign_idx = int(lon // 30)
    deg_in_sign = lon - sign_idx * 30
    return ZODIAC[sign_idx], deg_in_sign

def planet_positions(jd: float) -> Dict[str, Dict[str, float]]:
    """Return lon/lat/dist/speed for Sun–Pluto + Moon."""
    out: Dict[str, Dict[str, float]] = {}
    for name, code in PLANETS.items():
        xx, retflag = swe.calc_ut(jd, code, FLAG)  # xx=[lon,lat,dist,lon_speed,lat_speed,dist_speed]
        out[name] = {
            "lon": norm360(xx[0]),
            "lat": xx[1],
            "dist": xx[2],
            "speed": xx[3],
        }
    return out

def houses_asc_mc(jd: float, lat: float, lon: float, hs: str):
    """Return 12 house cusps, Ascendant, MC."""
    # swisseph expects a single BYTE like b'P'
    hs_byte = hs.encode("ascii")[0:1] if isinstance(hs, str) else hs
    houses, ascmc = swe.houses(jd, lat, lon, hs_byte)
    asc = norm360(ascmc[0])
    mc  = norm360(ascmc[1])
    return [norm360(h) for h in houses], asc, mc

def find_aspects(lons: Dict[str, float]) -> List[Dict]:
    names = list(lons.keys())
    aspects: List[Dict] = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            a, b = names[i], names[j]
            d = angle_diff(lons[a], lons[b])
            for asp_name, asp_angle in ASPECT_ANGLES.items():
                if abs(d - asp_angle) <= ASPECT_ORB_DEG:
                    aspects.append({
                        "a": a, "b": b,
                        "aspect": asp_name,
                        "angle": round(d, 2),
                        "orb": round(abs(d - asp_angle), 2),
                    })
    return aspects

# ──────────────────────────────────────────────────────────────────────────────
# Lifecycle
# ──────────────────────────────────────────────────────────────────────────────
@app.on_event("startup")
def setup():
    swe.set_ephe_path(os.environ.get("EPHE_PATH", "."))

# ──────────────────────────────────────────────────────────────────────────────
# Debug
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/debug")
def debug():
    ephe_path = os.environ.get("EPHE_PATH", ".")
    try:
        files = sorted(os.listdir(ephe_path))
    except Exception as e:
        files = [f"<error listing {ephe_path}: {e}>"]
    return {"ephe_path": ephe_path, "files": files, "swe_version": getattr(swe, "__version__", "unknown")}

# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/compute")
def compute(b: BirthData):
    try:
        jd = swe.julday(b.year, b.month, b.day, b.hour)  # hour must be UTC decimal
        planets = planet_positions(jd)
        houses, asc, mc = houses_asc_mc(jd, b.lat, b.lon, b.house_system)
        return {"jd": jd, "planets": planets, "asc": asc, "mc": mc, "houses": houses}
    except Exception as e:
        return {"error": str(e)}

@app.post("/divine-identity")
def divine_identity(b: BirthData):
    try:
        jd = swe.julday(b.year, b.month, b.day, b.hour)
        planets = planet_positions(jd)
        houses, asc, mc = houses_asc_mc(jd, b.lat, b.lon, b.house_system)

        sun_sign, sun_deg = sign_from_lon(planets["SUN"]["lon"])
        moon_sign, moon_deg = sign_from_lon(planets["MOON"]["lon"])
        asc_sign, asc_deg = sign_from_lon(asc)

        lons = {k: v["lon"] for k, v in planets.items()}
        aspects = find_aspects(lons)

        return {
            "jd": jd,
            "core": {
                "sun":  {"sign": sun_sign,  "deg": round(sun_deg, 2),  "lon": round(planets["SUN"]["lon"], 2)},
                "moon": {"sign": moon_sign, "deg": round(moon_deg, 2), "lon": round(planets["MOON"]["lon"], 2)},
                "asc":  {"sign": asc_sign,  "deg": round(asc_deg, 2),  "lon": round(asc, 2)},
                "mc": round(mc, 2),
            },
            "houses": [round(h, 2) for h in houses],
            "planets": {k: {"lon": round(v["lon"], 2), "lat": round(v["lat"], 4)} for k, v in planets.items()},
            "aspects": aspects,
        }
    except Exception as e:
        return {"error": str(e)}
