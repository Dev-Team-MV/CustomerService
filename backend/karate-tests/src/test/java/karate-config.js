function fn() {
  var baseUrl = karate.properties['baseUrl'] || java.lang.System.getenv('KARATE_BASE_URL') || 'http://localhost:5001';
  var adminEmail = karate.properties['adminEmail'] || java.lang.System.getenv('KARATE_ADMIN_EMAIL') || 'superadmin@lakewood.com';
  var adminPassword = karate.properties['adminPassword'] || java.lang.System.getenv('KARATE_ADMIN_PASSWORD') || 'admin123';
  var projectId = karate.properties['projectId'] || java.lang.System.getenv('KARATE_PROJECT_ID') || '69a73ce5b20401b061da6451';

  karate.configure('connectTimeout', 10000);
  karate.configure('readTimeout', 30000);

  return {
    baseUrl: baseUrl,
    adminEmail: adminEmail,
    adminPassword: adminPassword,
    projectId: projectId
  };
}
