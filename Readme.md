# Levels of authentication
## Level 1 - Username and password
  There is no encryption at all here. :P
## Level 2 - Encrypt
  This is just encrypting the data using a secret key, as long as key is exposed security is compromised
## Level 3 - MD5
  This is a hasing algorithm without any salt, a modern computer can create 2 million MD5 hash per second, easy to crack.
## Level 4 - Bcrypt
  This is a better hashing algorithm than MD5 with number of configurable salt rounds, modern computers create 17,000 bcrypt hash per secnod, Medium to Hard security depending upon the password.
## Level 5 - Passport Local
  This is done with the help of bcrypt for encryption, Passport to handle auth at each level, sessions and cooked to persist the login session.
## Level 6 - Passport OAuth
  This is when we delegate the tedious process of use login management to companies like google/ facebook.
  
