from apps.identity.authentication import SupabaseJWTAuthentication

def test_authenticate_header():
    assert SupabaseJWTAuthentication().authenticate_header(None) == 'Bearer'
