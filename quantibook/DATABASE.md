# Database Information

Internally, Quantibook stores its data using [DuckDB](https://duckdb.org/), a SQLite-like database for column-oriented data. We want to be able to track not only individual events (rows), but to look at trends in those numbers. DuckDB is tuned for looking at lots of aggregate data, and that's what we want.

## Schema

The `events` table:

- `id`: a unique identifier. Required.
- `datetime`: the instance that the event occured, stored as microseconds (µs) from the Unix epoch (1970-01-01 00:00:00+00). Required.
- `category`: a category that the event belongs to. A foreign key to the `category` table, by `category.id`. Required.
    - TODO: Decide if an event should have multiple tags. What if I want to track all the different kinds of food I eat, like tacos *and* dumplings? Do they both belong in the food category, or should I just include both of them in my visualization.
- `quantity`: an integer representing how many of the thing happened. Optional, defaults to 1.
- `description`: a variable-length string for notes about what happened. Maybe it was a lengua taco and you want to remember that. Optional, defaults to null.

The `category` table:

- `id`: a unique identifier. Required
- `name`: a variable-length string representing the human-readible name of the category. Required.
- TODO: Decide if categories can or should have a description.
