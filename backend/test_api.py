import os
import sys
import unittest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Ensure the backend directory is in the python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Load env variables
parent_dir = os.path.dirname(backend_dir)
load_dotenv(dotenv_path=os.path.join(parent_dir, '.env'))

from main import app

class TestMiceDashboardAPI(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # We wrap the client in a context manager to trigger FastAPI startup/shutdown events
        cls.client_context = TestClient(app)
        cls.client = cls.client_context.__enter__()
        
    @classmethod
    def tearDownClass(cls):
        cls.client_context.__exit__(None, None, None)

    def test_01_get_stats(self):
        print("Testing GET /api/stats...")
        response = self.client.get("/api/stats")
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        print(f"Stats results: {stats}")
        self.assertIn("total_count", stats)
        self.assertGreaterEqual(stats["total_count"], 5)
        self.assertIn("active_budget_sum", stats)
        self.assertGreaterEqual(stats["active_budget_sum"], 100000000) # At least 100M KRW
        
    def test_02_get_tenders_default(self):
        print("Testing GET /api/tenders (default)...")
        response = self.client.get("/api/tenders")
        self.assertEqual(response.status_code, 200)
        tenders = response.json()
        print(f"Retrieved {len(tenders)} tenders.")
        self.assertGreaterEqual(len(tenders), 5)
        # Verify columns exist
        first_tender = tenders[0]
        self.assertIn("bid_notice_no", first_tender)
        self.assertIn("title", first_tender)
        self.assertIn("budget", first_tender)
        self.assertIn("event_location", first_tender)
        
    def test_03_get_tenders_sorting(self):
        # Sort by budget
        print("Testing sorting by budget...")
        response = self.client.get("/api/tenders?sort=budget")
        self.assertEqual(response.status_code, 200)
        tenders_by_budget = response.json()
        budgets = [t["budget"] for t in tenders_by_budget if t["budget"] is not None]
        # Verify it is sorted in descending order
        self.assertEqual(budgets, sorted(budgets, reverse=True))
        
        # Sort by deadline
        print("Testing sorting by deadline...")
        response = self.client.get("/api/tenders?sort=deadline")
        self.assertEqual(response.status_code, 200)
        
    def test_04_get_tenders_search_and_filters(self):
        # Search keyword
        print("Testing search filter...")
        response = self.client.get("/api/tenders?search=아세안")
        self.assertEqual(response.status_code, 200)
        tenders = response.json()
        for t in tenders:
            self.assertIn("아세안", t["title"])
            
        # Category filter
        print("Testing category filter...")
        response = self.client.get("/api/tenders?category=컨퍼런스")
        self.assertEqual(response.status_code, 200)
        tenders = response.json()
        for t in tenders:
            self.assertEqual(t["category"], "컨퍼런스")

    def test_05_update_tender(self):
        print("Testing PUT /api/tenders/{id}...")
        # Get one tender ID
        response = self.client.get("/api/tenders")
        tenders = response.json()
        self.assertTrue(len(tenders) > 0)
        target_tender = tenders[0]
        tender_id = target_tender["id"]
        
        # Update details
        test_assignee = "홍길동 대리"
        test_memo = "제안서 작성 준비 시작, 일정 조율 중"
        test_user_status = "지원검토"
        test_venue = "서울 코엑스 신관 3층"
        
        payload = {
            "assignee": test_assignee,
            "memo": test_memo,
            "user_status": test_user_status,
            "event_location": test_venue
        }
        
        update_response = self.client.put(f"/api/tenders/{tender_id}", json=payload)
        self.assertEqual(update_response.status_code, 200)
        updated_tender = update_response.json()
        
        self.assertEqual(updated_tender["assignee"], test_assignee)
        self.assertEqual(updated_tender["memo"], test_memo)
        self.assertEqual(updated_tender["user_status"], test_user_status)
        self.assertEqual(updated_tender["event_location"], test_venue)
        
        # Verify stats updated
        stats_response = self.client.get("/api/stats")
        stats = stats_response.json()
        self.assertGreaterEqual(stats["reviewing_count"], 1)

if __name__ == "__main__":
    unittest.main()
