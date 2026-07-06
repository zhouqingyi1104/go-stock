package data

import "testing"

func TestParseInvestCalendarDataHandlesInvalidToken(t *testing.T) {
	items, msg := parseInvestCalendarData([]byte(`{"msg":"token无效，请重试","errCode":"9","serverTime":1783350546}`))
	if len(items) != 0 {
		t.Fatalf("expected no items for invalid token, got %d", len(items))
	}
	if msg != "token无效，请重试" {
		t.Fatalf("expected token error message, got %q", msg)
	}
}

func TestParseInvestCalendarDataReturnsData(t *testing.T) {
	items, msg := parseInvestCalendarData([]byte(`{"data":[{"date":"2026-07-06","list":[{"article_id":1,"title":"event"}]}]}`))
	if msg != "" {
		t.Fatalf("expected empty error message, got %q", msg)
	}
	if len(items) != 1 {
		t.Fatalf("expected one item, got %d", len(items))
	}
}

func TestClsCalendarToInvestTimeline(t *testing.T) {
	source := []any{
		map[string]any{
			"calendar_day": "2026-07-06",
			"items": []any{
				map[string]any{
					"id":    float64(101),
					"title": "A股交易新规将于7月6日起正式施行",
					"event": map[string]any{"star": float64(3)},
				},
				map[string]any{
					"id":       float64(102),
					"title":    "EIA公布月度短期能源展望报告",
					"economic": map[string]any{"star": float64(2)},
				},
			},
		},
		map[string]any{
			"calendar_day": "2026-08-01",
			"items": []any{
				map[string]any{"id": float64(201), "title": "other month"},
			},
		},
	}

	timeline := clsCalendarToInvestTimeline(source, "2026-07")
	if len(timeline) != 1 {
		t.Fatalf("expected one day in July, got %d", len(timeline))
	}

	day, ok := timeline[0].(map[string]any)
	if !ok {
		t.Fatalf("expected day map, got %T", timeline[0])
	}
	if day["date"] != "2026-07-06" {
		t.Fatalf("expected date 2026-07-06, got %#v", day["date"])
	}

	list, ok := day["list"].([]any)
	if !ok {
		t.Fatalf("expected list slice, got %T", day["list"])
	}
	if len(list) != 2 {
		t.Fatalf("expected two converted events, got %d", len(list))
	}

	first, ok := list[0].(map[string]any)
	if !ok {
		t.Fatalf("expected event map, got %T", list[0])
	}
	if first["title"] != "A股交易新规将于7月6日起正式施行" {
		t.Fatalf("unexpected title: %#v", first["title"])
	}
	if first["like_count"] != 3 {
		t.Fatalf("expected event star as like_count, got %#v", first["like_count"])
	}
}

func TestJiuyangongsheTokenFromTimestamp(t *testing.T) {
	t.Setenv("JIUYANGONGSHE_TOKEN", "")
	got := jiuyangongsheToken(1783350546000)
	const want = "f5b49d627f5baa0a83c46a5eab6ca91f"
	if got != want {
		t.Fatalf("expected dynamic token %s, got %s", want, got)
	}
}
