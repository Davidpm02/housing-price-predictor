"""Rutas del dashboard de estadísticas e insights del dataset."""

from fastapi import APIRouter, Query

from app.db import stats_repository as repo

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/summary")
def summary():
    return repo.get_summary_stats()


@router.get("/house-types")
def house_types():
    return repo.get_house_type_stats()


@router.get("/provinces")
def provinces():
    return repo.get_province_stats()


@router.get("/price-distribution")
def price_distribution():
    return repo.get_price_distribution()


@router.get("/scatter")
def scatter(n: int = Query(2000, ge=100, le=10000)):
    return repo.get_scatter_sample(n)


@router.get("/amenities")
def amenities():
    return repo.get_amenity_stats()


@router.get("/conditions")
def conditions():
    return repo.get_condition_stats()


@router.get("/m2-buckets")
def m2_buckets():
    return repo.get_m2_buckets()


@router.get("/correlation")
def correlation():
    return repo.get_correlation()


@router.get("/province-type")
def province_type():
    return repo.get_province_type_counts()


@router.get("/province-counts")
def province_counts():
    return repo.get_province_counts()