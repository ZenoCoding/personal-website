import java.util.Scanner;

/** Run: java TicTacToe.java. Fill in the three TODO methods. */
public class TicTacToe {
    final char[] board = {' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '};
    final int[][] winningLines = {
        {0, 1, 2}, {3, 4, 5}, {6, 7, 8},
        {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
        {0, 4, 8}, {2, 4, 6}
    };

    boolean isLegalMove(int square) {
        // TODO 1: Is square in 1–9, and is its position empty?
        return false;
    }

    boolean hasWon(char player) {
        // TODO 2: Does any winning line contain only this player?
        return false;
    }

    boolean isFull() {
        // TODO 3: Are there no empty squares left?
        return false;
    }

    void printBoard() {
        for (int i = 0; i < board.length; i++) {
            System.out.print(board[i] == ' ' ? Integer.toString(i + 1) : Character.toString(board[i]));
            System.out.print(i % 3 == 2 ? "\n" : " | ");
        }
    }

    void play() {
        Scanner input = new Scanner(System.in);
        char player = 'X';
        printBoard();
        while (true) {
            System.out.print(player + ": choose a square (1–9): ");
            if (!input.hasNext()) return;
            if (!input.hasNextInt()) {
                input.next();
                System.out.println("Enter a number.");
                continue;
            }
            int square = input.nextInt();
            if (!isLegalMove(square)) {
                System.out.println("Choose an empty square from 1–9.");
                continue;
            }
            board[square - 1] = player;
            printBoard();
            if (hasWon(player)) {
                System.out.println(player + " wins!");
                return;
            }
            if (isFull()) {
                System.out.println("Draw!");
                return;
            }
            player = player == 'X' ? 'O' : 'X';
        }
    }

    public static void main(String[] args) { new TicTacToe().play(); }
}
