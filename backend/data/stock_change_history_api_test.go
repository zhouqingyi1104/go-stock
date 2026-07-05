package data

import (
	"go-stock/backend/db"
	"go-stock/backend/models"
	"path/filepath"
	"testing"
)

func TestGetChangeRankForOneDayFallsBackToLatestSavedDay(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "stock.db")
	db.Init(dbPath)
	sqlDB, err := db.Dao.DB()
	if err != nil {
		t.Fatalf("open sqlite handle: %v", err)
	}
	defer sqlDB.Close()

	rows := []models.StockChangeHistory{
		{
			ChangeDate: "2026-07-03",
			ChangeTime: "10:00:00",
			StockCode:  "sz300580",
			StockName:  "贝斯特",
			ChangeType: 4,
			TypeName:   "涨停",
			Volume:     100,
			Price:      25.96,
			ChangeRate: 20,
			Industry:   "汽车零部件",
			Concept:    "机器人,新能源车",
		},
		{
			ChangeDate: "2026-07-02",
			ChangeTime: "10:00:00",
			StockCode:  "sh603009",
			StockName:  "北特科技",
			ChangeType: 8,
			TypeName:   "跌停",
			Volume:     100,
			Price:      53.34,
			ChangeRate: -10,
			Industry:   "汽车零部件",
			Concept:    "机器人",
		},
	}
	if err := db.Dao.Create(&rows).Error; err != nil {
		t.Fatalf("seed stock change history rows: %v", err)
	}

	got, err := NewStockChangeHistoryService().GetChangeRank(1, 20)
	if err != nil {
		t.Fatalf("get change rank: %v", err)
	}
	if len(got.TopStocks) != 1 {
		t.Fatalf("expected one latest-day stock rank row, got %#v", got.TopStocks)
	}
	if got.TopStocks[0].Name != "贝斯特" {
		t.Fatalf("expected latest saved day stock 贝斯特, got %#v", got.TopStocks[0])
	}
	if len(got.TopConcepts) != 2 {
		t.Fatalf("expected latest saved day concepts only, got %#v", got.TopConcepts)
	}
}
