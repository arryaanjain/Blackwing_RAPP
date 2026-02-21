# Vendor-Company Connection Seeders

## Files Created

1. **VendorCompanyConnectionRequestSeeder.php**
   - Seeds connection requests from vendor to company
   - Creates 3 different request statuses: pending, approved, denied

2. **VendorCompanyConnectionSeeder.php**
   - Seeds actual connections between vendor and company
   - Creates both active and revoked connections for testing

3. **VendorCompanyConnectionDataSeeder.php**
   - Combined seeder that runs both request and connection seeders
   - Use this for easy seeding of all connection data

## Test Data Created

### Users Involved:
- **Company**: jainarryaan@gmail.com (User ID: 2)
- **Vendor**: vpblackwing@gmail.com (User ID: 3)
- **Company Share ID**: COMP-6182

### Connection Requests (3 total):
1. **Pending Request**: Vendor requesting connection to company
2. **Approved Request**: Previously approved request with review notes
3. **Denied Request**: Previously denied request with reason

### Connections (1 total):
1. **Active Connection**: Currently active connection with full permissions
2. **Revoked Connection**: Previously revoked connection for testing

## Usage

### Run All Connection Seeders:
```bash
php artisan db:seed --class=VendorCompanyConnectionDataSeeder
```

### Run Individual Seeders:
```bash
php artisan db:seed --class=VendorCompanyConnectionRequestSeeder
php artisan db:seed --class=VendorCompanyConnectionSeeder
```

### Add to DatabaseSeeder:
The seeders are already added to `DatabaseSeeder.php` and will run with:
```bash
php artisan db:seed
```

## Features Included:
- ✅ Realistic test messages and review notes
- ✅ Proper timestamps for chronological testing
- ✅ Different request statuses (pending, approved, denied)
- ✅ Connection permissions and access tracking
- ✅ Revocation tracking with reasons
- ✅ Vendor profile snapshots
- ✅ Duplicate prevention logic
- ✅ Proper foreign key relationships
