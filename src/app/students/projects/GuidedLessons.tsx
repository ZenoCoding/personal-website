import type { ReactNode } from "react";
import Link from "next/link";
import CodeBlock from "../intake/CodeBlock";
import styles from "../Students.module.css";

function Step({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
    return <section className={styles.section} id={id}><h2>{title}</h2>{children}</section>;
}
function Solution({ children }: { children: string }) {
    return <details><summary>Show solution</summary><CodeBlock>{children}</CodeBlock></details>;
}

export function JavaLesson() {
    return <>
        <Step title="Before you start">
            <p>Use <a href="https://www.w3schools.com/java/">W3Schools Java</a> to practice variables, conditions, loops, arrays, methods, and classes. Run the examples and change a value or condition to see what happens. Those topics are enough to begin.</p>
            <p><a href="/lessons/practice/TicTacToe.java" download>Download TicTacToe.java</a>. The game can already read a move and print the board. It still accepts no moves: you’ll fill in the three methods that check the rules. Run it with <code>java TicTacToe.java</code> using a Java JDK, such as the one included with WPILib.</p>
        </Step>
        <Step title="1. Follow the board state">
            <p>The board is an array of nine characters. A space means the square is empty. Array positions start at zero, while players enter numbers from 1 to 9.</p>
            <CodeBlock>{`char[] board = {' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '};
char player = 'X';

// Player enters square 5:
int index = 5 - 1;
board[index] = player;`}</CodeBlock>
            <p><strong>Write:</strong> finish isLegalMove. Check the number before indexing the array so an out-of-range input cannot crash the game.</p>
            <CodeBlock>{`boolean isLegalMove(int square) {
    // Return false if square is outside 1–9.
    // Otherwise return whether that square is empty.
    return false;
}`}</CodeBlock>
            <Solution>{`boolean isLegalMove(int square) {
    if (square < 1 || square > 9) return false;
    return board[square - 1] == ' ';
}`}</Solution>
            <p><strong>Check:</strong> enter 5, then 5 again. The second move should be rejected. Try 0 and 10 too.</p>
        </Step>
        <Step title="2. Find three in a row">
            <p>The starter lists the eight possible winning lines. For one line, compare all three squares with the same player:</p>
            <CodeBlock>{`// Top row, for example:
boolean topRow = board[0] == player
    && board[1] == player
    && board[2] == player;`}</CodeBlock>
            <p><strong>Write:</strong> in hasWon, loop over winningLines. Return true when all three positions in any line match player. Return false after checking every line.</p>
            <Solution>{`boolean hasWon(char player) {
    for (int[] line : winningLines) {
        if (board[line[0]] == player
                && board[line[1]] == player
                && board[line[2]] == player) {
            return true;
        }
    }
    return false;
}`}</Solution>
            <p><strong>Check:</strong> enter 1, 4, 2, 5, 3. X should win across the top row. Explain why returning false inside the loop would miss some wins.</p>
        </Step>
        <Step title="3. Detect a draw">
            <p>A full board has no spaces left. The supplied game loop checks for a win first, then a full board.</p>
            <p><strong>Write:</strong> finish isFull by looping over board. Finding one space is enough to return false.</p>
            <Solution>{`boolean isFull() {
    for (char square : board) {
        if (square == ' ') return false;
    }
    return true;
}`}</Solution>
            <p><strong>Check:</strong> enter 1, 2, 3, 5, 4, 6, 8, 7, 9. The game should end in a draw.</p>
        </Step>
        <Step title="Try one change yourself">
            <p>Let the players choose whether X or O starts, then replay the draw case. If the wrong player wins or gets two turns, trace where you change player. Bring that example to a mentor if you cannot find the mistake.</p>
            <p>Next: <Link href="/students/commands">WPILib Commands in Practice</Link>.</p>
        </Step>
    </>;
}

export function IntakeLesson() {
    return <>
        <Step title="Set up the practice intake">
            <p>You’ll make A collect a piece, B reverse the rollers, and X stop them. The practice intake stores an output number and shows it on the dashboard. You supply the piece-detection value yourself.</p>
            <p>Create a Java command-based WPILib project. Put <a href="/lessons/practice/PracticeIntake.java" download>PracticeIntake.java</a> in <code>src/main/java/frc/robot/subsystems/</code>. It contains the roller methods and sensor getter. You’ll add the commands below. After editing Java code, stop and relaunch simulation to run the new version.</p>
        </Step>
        <Step title="Open the dashboard" id="desktop">
            <p>First create the practice intake in RobotContainer. Add the import at the top of the file and the field inside the class, above its constructor:</p>
            <CodeBlock>{`import frc.robot.subsystems.PracticeIntake;

// Inside RobotContainer:
private final PracticeIntake intake = new PracticeIntake();`}</CodeBlock>
            <ol>
                <li>Run <strong>WPILib: Simulate Robot Code</strong> from the VS Code command palette and select Sim GUI.</li>
                <li>Drag a keyboard from System Joysticks to port 0. Use DS → Keyboard 0 Settings to map buttons A, B, and X (button numbers 1, 2, and 3).</li>
                <li>Select Teleoperated and Enabled. Open NetworkTables → SmartDashboard.</li>
                <li>Watch Practice/RollerOutput and edit Practice/HasPiece to provide the sensor input.</li>
            </ol>
            <p>You should see Practice/RollerOutput at zero and Practice/HasPiece set to false. <a href="https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/robot-simulation/simulation-gui.html">WPILib’s GUI guide</a> shows the setup.</p>
            <p>If the simulator will not launch, ask a mentor to help with setup. Meanwhile, <a href="/lessons/practice/IntakePractice.java" download>this plain Java exercise</a> lets you practice input decisions in a console: reverse requests −0.5; otherwise acquire without a piece requests 0.5; otherwise request zero. Once setup is fixed, come back to the command exercises here.</p>
        </Step>
        <Step title="1. Read what the subsystem does">
            <p>A field belongs to an object and keeps its value between method calls. Here, startRollers changes the requested output; periodic publishes it each scheduler loop.</p>
            <CodeBlock>{`private double rollerOutput = 0.0;

public void startRollers() { rollerOutput = 0.5; }
public void stopRollers() { rollerOutput = 0.0; }

@Override
public void periodic() {
    SmartDashboard.putNumber("Practice/RollerOutput", rollerOutput);
}`}</CodeBlock>
            <p><strong>Write:</strong> add a getRollerOutput method that returns the field. Then add a slowRollers method that assigns 0.2 to that field.</p>
            <Solution>{`public double getRollerOutput() { return rollerOutput; }
public void slowRollers() { rollerOutput = 0.2; }`}</Solution>
            <p>Temporarily add these calls at the end of the PracticeIntake constructor, after the dashboard initialization:</p>
            <CodeBlock>{`startRollers();
System.out.println(getRollerOutput());
slowRollers();
System.out.println(getRollerOutput());
stopRollers();
System.out.println(getRollerOutput());`}</CodeBlock>
            <p><strong>Check:</strong> restart simulation and look in the VS Code terminal for 0.5, 0.2, and 0.0. Remove these temporary calls afterward. The next step will call the methods from buttons.</p>
        </Step>
        <Step title="2. Run while a button is held">
            <p>Add this import and method to PracticeIntake. startEnd calls the first action when scheduled and the second when interrupted or ended. Because this is a subsystem method, the resulting command requires this intake.</p>
            <CodeBlock>{`import edu.wpi.first.wpilibj2.command.Command;

public Command runRollersCommand() {
    return startEnd(this::startRollers, this::stopRollers);
}`}</CodeBlock>
            <p><code>this::startRollers</code> passes an action to call later. It does not call startRollers while the command is being created.</p>
            <p><strong>Write:</strong> add reverseCommand with the same structure. It should reverse at the start and stop at the end.</p>
            <Solution>{`public Command reverseCommand() {
    return startEnd(this::reverseRollers, this::stopRollers);
}`}</Solution>
            <p>In RobotContainer, add the controller import and field below. Keep the intake field you created during setup. Put the button bindings inside the existing configureBindings method:</p>
            <CodeBlock>{`import edu.wpi.first.wpilibj2.command.button.CommandXboxController;

// Field inside RobotContainer:
private final CommandXboxController controller = new CommandXboxController(0);

// Inside configureBindings():
controller.a().whileTrue(intake.runRollersCommand());
// TODO: Bind B to reverseCommand while held.`}</CodeBlock>
            <Solution>{`controller.b().whileTrue(intake.reverseCommand());`}</Solution>
            <p><strong>Check:</strong> A requests 0.5 while held, then zero. B requests −0.5 while held, then zero. Pressing B during A interrupts the first command because both require the same intake.</p>
        </Step>
        <Step title="3. Stop when a piece arrives">
            <p>hasPiece reads a dashboard boolean each time it is called. until accepts a function that checks this value repeatedly while the command runs.</p>
            <CodeBlock>{`public Command acquireCommand() {
    return runRollersCommand().until(this::hasPiece);
}`}</CodeBlock>
            <p><strong>Write:</strong> add a two-second timeout using withTimeout. Then replace the A binding with onTrue so one press starts acquisition. Do not leave both A bindings in place.</p>
            <Solution>{`public Command acquireCommand() {
    return runRollersCommand()
        .until(this::hasPiece)
        .withTimeout(2.0);
}

// Replace the old A binding in configureBindings():
controller.a().onTrue(intake.acquireCommand());`}</Solution>
            <p><strong>Check:</strong> press A, then set HasPiece to true. Output should return to zero. Reset HasPiece to false and try again without detecting a piece: it should stop after two seconds. In both cases the end action calls stopRollers().</p>
            <p>If HasPiece is already true, startEnd still starts before until checks the condition. To avoid that initial start, add <code>.unless(this::hasPiece)</code> to the command. Try this case too.</p>
        </Step>
        <Step title="4. Add a cancel button">
            <p>A new command requiring the intake interrupts the current intake command. This lets a stop command cancel either acquisition or reverse.</p>
            <p><strong>Write:</strong> add stopCommand using runOnce(this::stopRollers), then bind it to X with onTrue.</p>
            <Solution>{`public Command stopCommand() {
    return runOnce(this::stopRollers);
}

// In configureBindings():
controller.x().onTrue(intake.stopCommand());`}</Solution>
            <p><strong>Check:</strong> start acquisition and press X before a piece arrives. Output should stay at zero. Repeat while holding B. After interruption, whileTrue will not restart reverse until B is released and pressed again.</p>
        </Step>

        <Step title="Now make one change">
            <p>Add a command that acquires slowly using slowRollers. Reuse the sensor stop and timeout. Explain to a mentor where the command starts, why it ends, and what stops the output.</p>
            <p>For motor configuration and arm control, continue with <Link href="/students/intake#prereqs">the hardware intake walkthrough</Link>. Bring your completed laptop code so you can compare how the two subsystems handle the same actions.</p>
        </Step>
    </>;
}

export function ElevatorProject() {
    return <>
        <Step title="Build an elevator subsystem">
            <p>Use the intake code as a reference and write this subsystem yourself. Choose the class structure and command methods. Bring questions about the mechanism before choosing its constants.</p>
            <p>For tuning, use the <Link href="/students/pid">WPILib PID readings and walkthroughs</Link>.</p>
        </Step>
        <Step title="Requirements">
            <ul>
                <li><strong>Position control:</strong> move to three named heights and hold position when a move finishes. Use meters for heights and keep gearing, limits, and gains in a constants file.</li>
                <li><strong>Homing:</strong> provide a command that lowers the elevator slowly to a known bottom position, using a limit switch or sustained current detection. Set the encoder position only after detecting home. A brief current spike must not count as home.</li>
                <li><strong>Failure handling:</strong> stop homing on cancellation or timeout, report the failure, and leave the elevator unhomed. Reject position commands until homing succeeds.</li>
                <li><strong>Travel limits:</strong> keep targets within the configured height range and prevent motion farther past either limit.</li>
                <li><strong>Commands:</strong> declare the elevator requirement. Decide what happens when a move is interrupted and document that behavior.</li>
                <li><strong>Telemetry:</strong> publish measured height, target height, position error, motor output and current, homing status, and any fault. Include units in numeric labels.</li>
            </ul>
        </Step>
        <Step title="Show your work">
            <p>Bring the code to review and walk through a successful home, a failed home, a move to each height, and an interrupted move. Show where the telemetry would explain a problem. You can compile and review these cases without hardware; movement and tuning checks will need the elevator.</p>
        </Step>
    </>;
}
