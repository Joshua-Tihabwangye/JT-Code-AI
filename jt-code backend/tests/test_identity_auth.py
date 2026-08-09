from apps.identity.authentication import ClerkJWTAuthentication

def test_authenticate_header():
    assert ClerkJWTAuthentication().authenticate_header(None) == 'Bearer'
