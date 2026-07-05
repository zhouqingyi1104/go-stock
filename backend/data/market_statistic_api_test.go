package data

import (
	"go-stock/backend/db"
	"go-stock/backend/models"
	"path/filepath"
	"testing"
)

func TestMarketStatisticLatestAvailableDataReturnsNewestSavedDay(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "stock.db")
	db.Init(dbPath)
	sqlDB, err := db.Dao.DB()
	if err != nil {
		t.Fatalf("open sqlite handle: %v", err)
	}
	defer sqlDB.Close()

	rows := []models.MarketStatistic{
		{DataDate: "2026-07-02", DataTime: "10:00", UpCount: 100, DownCount: 200},
		{DataDate: "2026-07-03", DataTime: "10:00", UpCount: 300, DownCount: 100},
		{DataDate: "2026-07-03", DataTime: "14:55", UpCount: 500, DownCount: 80},
	}
	if err := db.Dao.Create(&rows).Error; err != nil {
		t.Fatalf("seed market statistic rows: %v", err)
	}

	got := NewMarketStatisticApi().GetLatestAvailableData()
	if len(got) != 2 {
		t.Fatalf("expected 2 rows from latest saved day, got %d: %#v", len(got), got)
	}
	for _, row := range got {
		if row.DataDate != "2026-07-03" {
			t.Fatalf("expected latest saved trading day 2026-07-03, got %s", row.DataDate)
		}
	}
	if got[0].DataTime != "10:00" || got[1].DataTime != "14:55" {
		t.Fatalf("expected rows ordered by time, got %#v", got)
	}
}

func TestMarketStatisticRecentDaysDataAnchorsToLatestSavedDay(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "stock.db")
	db.Init(dbPath)
	sqlDB, err := db.Dao.DB()
	if err != nil {
		t.Fatalf("open sqlite handle: %v", err)
	}
	defer sqlDB.Close()

	rows := []models.MarketStatistic{
		{DataDate: "2000-01-01", DataTime: "15:00", UpCount: 100, DownCount: 200},
		{DataDate: "2000-01-03", DataTime: "15:00", UpCount: 300, DownCount: 100},
	}
	if err := db.Dao.Create(&rows).Error; err != nil {
		t.Fatalf("seed market statistic rows: %v", err)
	}

	got := NewMarketStatisticApi().GetRecentDaysData(1)
	if len(got) != 1 {
		t.Fatalf("expected latest saved day only, got %d rows: %#v", len(got), got)
	}
	if got[0].DataDate != "2000-01-03" {
		t.Fatalf("expected latest saved trading day 2000-01-03, got %s", got[0].DataDate)
	}
}
