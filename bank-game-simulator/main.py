import numpy as np

def generate_rolls(n):
    rolls = np.zeros((n, 3))
    rolls[:, 0:2] = np.random.randint(low=1, high=6, size=(n, 2))
    rolls[:, 2] = np.sum(rolls, axis=1).T
    return rolls

def sum_scores(roll):
    pass

def main():
    # generate
    pass


if __name__ == "__main__":
    main()
