import asyncio
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import controllers.user_controller as uc

class FakeUsersCollection:
    def __init__(self):
        self.users = {}

    async def find_one(self, query):
        return self.users.get(query.get('email'))

    async def update_one(self, query, update, upsert=False):
        email = query.get('email')
        consultoria = update.get('$set', {}).get('consultoria')
        if email and consultoria:
            self.users[email] = {'_id': 'fakeid', 'email': email, 'consultoria': consultoria}
        class Result:
            raw_result = {'updatedExisting': True}
        return Result()


def test_set_user_consultoria_and_get(monkeypatch):
    fake_db = {'users': FakeUsersCollection()}
    monkeypatch.setattr(uc, 'db', fake_db)

    async def run_test():
        payload = {'email': 'teste@provedor.com', 'consultoria': 'Infra'}
        saved = await uc.set_user_consultoria(payload['email'], payload['consultoria'])
        assert saved['email'] == payload['email']
        assert saved['consultoria'] == payload['consultoria']

        result = await uc.get_user_consultoria(payload['email'])
        assert result['consultoria'] == payload['consultoria']

    asyncio.run(run_test())
