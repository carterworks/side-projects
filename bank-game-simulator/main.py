import numpy as np

def generate_rolls(n):
    """Generates n rolls of 2d6. Returns numpy matrix where one row is [dice_1, dice_2, sum_of_dice_1_and_dice_2]
    """
    rolls = np.zeros((n, 3))
    rolls[:, 0:2] = np.random.randint(low=1, high=6, size=(n, 2))
    rolls[:, 2] = np.sum(rolls, axis=1).T
    return rolls

def trim_zeros(arr):
    """Returns a trimmed view of an n-D array excluding any outer
    regions which contain only zeros.
    """
    slices = tuple(slice(idx.min(), idx.max() + 1) for idx in np.nonzero(arr))
    return arr[slices]

def sum_scores(rolls):
    """Takes 2D list of rolls, where one row is [dice_1, dice_2, sum_of_dice_1_and_dice_2]
    and applies the rules of the game, breaking down the rolls into rounds and scoring them.
    Returns a 2D list of rounds, where one row is [number_of_rolls_in_round, round_max_score]
    """
    round_num = 0
    rounds = np.zeros((rolls.shape[0], 2))
    rolls_in_round = 1
    round_total = 0
    for a, b, roll_sum in rolls:
        # print(f"{a} + {b} = {roll_sum}. {rolls_in_round = }, {round_total = }")
        if rolls_in_round <= 3:
            if roll_sum == 7:
                round_total += 70
            else:
                round_total += roll_sum
            rolls_in_round += 1
        else:
            if a == b:
                round_total *= 2
            if roll_sum == 7:
                rounds[round_num, 0] = rolls_in_round
                rounds[round_num, 1] = round_total
                round_total = 0
                rolls_in_round = 1
                round_num += 1
                continue
            else:
                round_total += roll_sum
            rolls_in_round += 1
    rounds[round_num, 0] = rolls_in_round
    rounds[round_num, 1] = round_total
    return trim_zeros(rounds)

def get_average_performance(rounds):
    """Takes a 2D list of Returns a 2D list of rounds, where one row is 
    [number_of_rolls_in_round, round_max_score]. Returns the average of each list column
    as a 1d np list.
    """
    return np.mean(rounds, axis=0)

def run_simulation(n):
    """Simulates an entire game of BANK! with n rolls. Returns the average of each list column
    as a 1d np list. 
    """
    return get_average_performance(sum_scores(generate_rolls(n)))
