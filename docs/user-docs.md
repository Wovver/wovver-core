# User Model Documentation

The `User` model defines the structure of a user record in the database with the following fields:

| Field     | Type            | Description                                      |
|-----------|-----------------|--------------------------------------------------|
| `id`      | `INTEGER`       | The unique identifier for each user. It is the primary key and auto-increments. |
| `username`| `STRING`        | The username of the user.
| `email`   | `STRING`        | The user's email address. 
| `password`| `STRING`        | The user's hashed password. 
| `flags`   | `INTEGER`       | A bitfield used to store various user flags (e.g., STAFF, BLUE_CHECK, DEVELOPER). The default value is `0`. |

### Explanation:

- **id**: The unique identifier for the user in the system. This field is set to auto-increment, meaning each new user gets a unique `id` automatically.
  
- **username**: A required field representing the user's chosen username. It cannot be left empty.

- **email**: A required and unique field that stores the user's email address, ensuring no two users can have the same email address.

- **password**: A required field that stores the user's password, typically hashed for security reasons.

- **flags**: This field uses an integer value to store various flags representing user roles or statuses. Flags can be manipulated using bitwise operations (add, check, remove). The default value is `0`, indicating no flags are set by default.

### Notes on Flags:
- **STAFF**: Flag indicating that the user is an employee or staff member.
- **BLUE_CHECK**: Flag indicating that the user is a verified famous person or user.
- **DEVELOPER**: Flag indicating that the user has a developer badge.

This model allows for flexible user role management through bitwise flag operations.
