/** Run with: java IntakePractice.java (JDK 17 or newer).
 * Outputs are requests, not simulated motor motion.
 */
public class IntakePractice {
    static class Intake {
        double rollerOutput;

        void update(boolean acquire, boolean reverse, boolean hasPiece) {
            // TODO: reverse -> -0.5; otherwise acquire without a piece -> 0.5;
            // otherwise -> 0.0. Assign rollerOutput on every call.
        }
    }

    public static void main(String[] args) {
        // acquire, reverse, piece; consecutive updates on the SAME object.
        boolean[][] inputs = {
            {false, false, false}, {true, false, false},
            {true, false, true}, {true, true, true},
            {false, true, false}, {false, false, false},
            {true, true, false}, {false, false, true}
        };
        double[] expected = {0, 0.5, 0, -0.5, -0.5, 0, -0.5, 0};
        Intake intake = new Intake();
        for (int i = 0; i < inputs.length; i++) {
            boolean[] row = inputs[i];
            intake.update(row[0], row[1], row[2]);
            System.out.printf("%d acquire=%s reverse=%s piece=%s | output=%4.1f expected=%4.1f %s%n",
                i + 1, row[0], row[1], row[2], intake.rollerOutput, expected[i],
                intake.rollerOutput == expected[i] ? "OK" : "CHECK");
        }
    }
}
