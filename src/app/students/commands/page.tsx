import { Metadata } from "next";
import Link from "next/link";
import styles from "../intake/Intake.module.css";
import CodeBlock from "../intake/CodeBlock";
import LessonNav from "../intake/LessonNav";
import Quiz from "../intake/Quiz";

const lessonSections = [
    { id: "overview", label: "Prerequisite" },
    { id: "scheduler", label: "Scheduler Model" },
    { id: "command-class", label: "Command Class" },
    { id: "factories", label: "Command Factories" },
    { id: "requirements", label: "Requirements" },
    { id: "bindings", label: "Controller Bindings" },
    { id: "composition", label: "Composition" },
    { id: "ending", label: "Ending & Cleanup" },
    { id: "defaults", label: "Default Commands" },
    { id: "debugging", label: "Debugging" },
    { id: "summary", label: "Summary" },
];

export const metadata: Metadata = {
    title: "WPILib Commands in Practice | Student Resources",
    description: "Common WPILib command patterns, bindings, requirements, and compositions.",
    robots: { index: false, follow: false },
};

export default function CommandsLessonPage() {
    return (
        <main className={styles.page}>
            <LessonNav sections={lessonSections} />
            <article className={styles.article}>
                <Link href="/students" className={styles.backNav}>
                    <span>←</span> Back to Resources
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>WPILib Commands in Practice</h1>
                    <p className={styles.subtitle}>
                        A button press is the easy part. Here we’ll also handle what happens when the driver lets go, a sensor trips, or another command interrupts.
                    </p>

                    <div className={styles.lessonMeta}>
                        <span className={`${styles.difficultyBadge} ${styles.intermediate}`}>
                            Intermediate
                        </span>
                        <div className={styles.learningTags}>
                            <span className={styles.tag}>CommandScheduler</span>
                            <span className={styles.tag}>Triggers</span>
                            <span className={styles.tag}>Requirements</span>
                            <span className={styles.tag}>Composition</span>
                            <span className={styles.tag}>Interruption</span>
                        </div>
                    </div>
                </header>

                <Section id="overview" title="Prerequisite">
                    <p>On your first pass, work through the command class and roller exercise, then requirements, bindings, and composition. The other factory and decorator examples are here when you need them. For a runnable project, use <Link href="/students/projects/intake-practice">Practice an intake on your laptop</Link>.</p>
                    <p>
                        You should be comfortable with Java methods and fields. In the examples, <code>this::stopRollers</code> passes a method for the command to call later; <code>() -&gt; motor.setVoltage(6)</code> does the same for an action with an argument.
                    </p>
                    <DocLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/">
                        WPILib command-based programming introduction →
                    </DocLink>
                </Section>

                <Section id="scheduler" title="The Scheduler Model">
                    <p>
                        A command runs only after a trigger, autonomous routine, default command, or
                        <code> schedule()</code> schedules it.
                    </p>

                    <CodeBlock language="text">{`scheduled
   ↓
initialize()                 once
   ↓
execute()                    every scheduler loop
   ↓
isFinished()?                checked every loop
   ├─ false → execute again
   └─ true  → end(false)     normal finish

requirement conflict, button release, or cancel()
   └────────→ end(true)      interrupted`}</CodeBlock>

                    <p>
                        The scheduler ordinarily runs every 20 milliseconds. During each iteration it
                        runs subsystem <code>periodic()</code> methods, polls triggers, executes scheduled
                        commands, ends finished commands, and schedules default commands for free subsystems.
                    </p>
                    <DocLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/command-scheduler.html">
                        WPILib command scheduler documentation →
                    </DocLink>

                    <InfoBox>
                        <p><code>end(false)</code> means normal completion. <code>end(true)</code> means
                            interruption. For the roller commands below, call <code>stopRollers()</code> in either case.</p>
                    </InfoBox>
                </Section>

                <Section id="command-class" title="Defining a Command Class">
                    <p>
                        A command class extends <code>Command</code>. Override only the lifecycle methods
                        it needs.
                    </p>
                    <CodeBlock>{`import edu.wpi.first.wpilibj2.command.Command;

public class RunIntakeCommand extends Command {
    private final Intake intake;

    public RunIntakeCommand(Intake intake) {
        this.intake = intake;
        addRequirements(intake);
    }

    @Override
    public void initialize() {
        intake.startRollers();
    }

    @Override
    public void execute() {
        // Runs every scheduler loop.
    }

    @Override
    public boolean isFinished() {
        return intake.hasPiece();
    }

    @Override
    public void end(boolean interrupted) {
        intake.stopRollers();
    }
}`}</CodeBlock>
                    <p>
                        <code>addRequirements(intake)</code> gives the command exclusive control of the
                        intake while it is scheduled. The factories below create the same lifecycle with
                        less code.
                    </p>
                </Section>

                <Quiz
                    question="A command is created in RobotContainer, but it is not bound, scheduled, or set as a default. What happens?"
                    options={[
                        { text: "Its initialize() method runs once" },
                        { text: "It runs whenever its subsystem is free" },
                        { text: "Nothing; constructing a command does not schedule it", correct: true },
                        { text: "It runs only during autonomous" },
                    ]}
                    explanation="The scheduler runs only scheduled commands."
                />

                <Section id="factories" title="Command Factories">
                    <p>
                        Choose a factory based on what runs once, what repeats, and what runs at the end.
                    </p>

                    <ConceptCard title="runOnce: change something and finish">
                        <p>Use this for setting a goal, changing a solenoid, or resetting an encoder.</p>
                        <CodeBlock>{`public Command stowCommand() {
    return runOnce(() -> targetAngle = STOW_ANGLE);
}`}</CodeBlock>
                        <p>
                            Subsystem instance factories automatically require that subsystem.
                        </p>
                    </ConceptCard>

                    <ConceptCard title="run: repeat until interrupted">
                        <p>Use this when the body must be evaluated every scheduler loop.</p>
                        <CodeBlock>{`public Command driveCommand(
        DoubleSupplier forward,
        DoubleSupplier turn) {
    return run(() -> drive(forward.getAsDouble(), turn.getAsDouble()));
}`}</CodeBlock>
                        <Hint>
                            Pass suppliers instead of numbers. The lambda reads the newest joystick
                            values every loop.
                        </Hint>
                    </ConceptCard>

                    <ConceptCard title="startEnd: start once, clean up at the end">
                        <p>
                            Use this when the output stays active after one call, such as a fixed motor
                            voltage. The command runs until interrupted.
                        </p>
                        <CodeBlock>{`public Command intakeCommand() {
    return startEnd(
        this::startRollers,
        this::stopRollers
    );
}`}</CodeBlock>
                    </ConceptCard>

                    <Challenge>
                        <p><strong>Practice:</strong> Run the rollers at 6 volts until the command is canceled.
                            Stop the motor when it ends.</p>
                        <CodeBlock>{`public Command runRollersCommand() {
    // Your code
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`public Command runRollersCommand() {
    return startEnd(
        () -> rollerMotor.setVoltage(6.0),
        rollerMotor::stopMotor
    );
}`}</CodeBlock>
                        </Solution>
                    </Challenge>

                    <h3>Other factories you may need</h3>
                    <ConceptCard title="runEnd: repeat, then clean up">
                        <p>
                            Use this when an output changes every loop and must be stopped afterward.
                        </p>
                        <CodeBlock>{`public Command manualArmCommand(DoubleSupplier speed) {
    return runEnd(
        () -> setArmVoltage(speed.getAsDouble() * 4.0),
        this::stopArm
    );
}`}</CodeBlock>
                    </ConceptCard>

                    <ConceptCard title="startRun: initialize once, then repeat">
                        <p>
                            Use this to reset a controller before its first update. It has no cleanup action.
                        </p>
                        <CodeBlock>{`public Command aimCommand(DoubleSupplier target) {
    return startRun(
        controller::reset,
        () -> aimWithController(target.getAsDouble())
    );
}`}</CodeBlock>
                    </ConceptCard>

                    <ConceptCard title="FunctionalCommand: custom lifecycle">
                        <p>
                            This supplies initialize, execute, end, and finish functions directly. Use a
                            named class when the command has substantial internal state or logic.
                        </p>
                        <CodeBlock>{`return new FunctionalCommand(
    this::beginCalibration,
    this::sampleCalibration,
    interrupted -> finishCalibration(),
    this::calibrationComplete,
    this
);`}</CodeBlock>
                    </ConceptCard>

                    <DocLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html">
                        WPILib command factories and lifecycle documentation →
                    </DocLink>
                </Section>

                <Section id="requirements" title="Requirements">
                    <p>
                        Require every subsystem whose outputs the command controls. A new command normally
                        interrupts the current owner of a shared requirement.
                    </p>

                    <CodeBlock>{`// Subsystem instance factory: requires "this" automatically
public Command shootCommand() {
    return startEnd(this::startFlywheel, this::stopFlywheel);
}

// Static factory: pass requirements explicitly
Command rumbleAndFeed = Commands.runEnd(
    () -> feeder.feed(),
    feeder::stop,
    feeder
);`}</CodeBlock>

                    <InfoBox>
                        <p>Declare a requirement for each subsystem whose motor output or goal the command changes. Reading a sensor value alone does not reserve that subsystem.</p>
                    </InfoBox>

                    <p>If both intake commands declare the intake requirement, scheduling one interrupts the other under the default interruption policy. The requirement only works if you declare it; it does not prevent arbitrary code from writing to a motor.</p>

                    <h3>Parallel composition rule</h3>
                    <p>
                        Commands inside the same parallel group cannot share requirements. If two parallel
                        branches both require the arm, the parallel group cannot run them together.
                        Combine the arm behavior into one branch or restructure the group.
                    </p>
                </Section>

                <Quiz
                    question="A drivetrain default command is running. A path-following command requiring the drivetrain is scheduled. What normally happens?"
                    options={[
                        { text: "Both commands write to the drivetrain" },
                        { text: "The path command waits in a queue" },
                        { text: "The default command is interrupted and the path command starts", correct: true },
                        { text: "The scheduler throws an exception" },
                    ]}
                    explanation="The scheduler frees the shared requirement by interrupting the current command. The default command returns when the drivetrain becomes free again."
                />

                <Section id="bindings" title="Controller and Sensor Bindings">
                    <p>
                        Configure bindings once in <code>RobotContainer</code>. Do not poll controller
                        buttons and schedule new commands manually from <code>periodic()</code>.
                    </p>

                    <ConceptCard title="onTrue: schedule once on the rising edge">
                        <CodeBlock>{`driver.y().onTrue(intake.stowCommand());`}</CodeBlock>
                        <p>Use it for a finite action or a one-time state change.</p>
                    </ConceptCard>

                    <ConceptCard title="whileTrue: run while held, cancel on release">
                        <CodeBlock>{`driver.rightBumper().whileTrue(intake.intakeCommand());`}</CodeBlock>
                        <p>
                            If the command finishes while the button remains held, <code>whileTrue</code>
                            does not schedule it again until the trigger becomes false and then true.
                        </p>
                    </ConceptCard>

                    <ConceptCard title="onFalse: react to release">
                        <CodeBlock>{`driver.a()
    .onTrue(climber.unlockCommand())
    .onFalse(climber.lockCommand());`}</CodeBlock>
                    </ConceptCard>

                    <ConceptCard title="toggleOnTrue: available, but easy to lose track of">
                        <p>
                            Toggles make the driver remember hidden state. Prefer hold-to-run or separate
                            start and stop buttons when the driver needs to know the mechanism’s state from the button position.
                        </p>
                    </ConceptCard>

                    <ConceptCard title="Triggers can come from sensors and logic">
                        <CodeBlock>{`Trigger hasPiece = new Trigger(intake::hasPiece);

hasPiece
    .debounce(0.10)
    .onTrue(leds.flashCommand());

driver.leftBumper()
    .and(driver.rightBumper())
    .onTrue(climber.releaseCommand());`}</CodeBlock>
                        <p>
                            Debounce noisy digital sensors. Compose triggers with <code>and</code>,
                            <code>or</code>, and <code>negate</code> to combine conditions—for example, a button held while a piece is detected.
                        </p>
                    </ConceptCard>

                    <Challenge>
                        <p><strong>Practice:</strong> Run the intake while A is held. Stow it once when Y is pressed.</p>
                        <CodeBlock>{`// Fill in the bindings
driver.a().___(intake.intakeCommand());
driver.y().___(intake.stowCommand());`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`driver.a().whileTrue(intake.intakeCommand());
driver.y().onTrue(intake.stowCommand());`}</CodeBlock>
                        </Solution>
                    </Challenge>

                    <DocLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/binding-commands-to-triggers.html">
                        WPILib trigger binding documentation →
                    </DocLink>
                </Section>

                <Section id="composition" title="Command Composition">
                    <p>
                        A command composition is itself a command. It requires all the subsystems required by
                        its children and starts, ends, or interrupts those commands according to the composition type.
                    </p>

                    <ConceptCard title="Sequence: one after another">
                        <CodeBlock>{`Commands.sequence(
    arm.moveToCommand(SCORE_ANGLE),
    shooter.waitUntilReadyCommand(),
    feeder.feedCommand().withTimeout(0.35),
    arm.moveToCommand(STOW_ANGLE)
);`}</CodeBlock>
                        <p><code>a.andThen(b)</code> is the same idea for a short chain.</p>
                    </ConceptCard>

                    <ConceptCard title="Parallel: finish when every command finishes">
                        <CodeBlock>{`Commands.parallel(
    arm.moveToCommand(SCORE_ANGLE),
    shooter.spinUpUntilReadyCommand()
);`}</CodeBlock>
                        <p><code>a.alongWith(b)</code> is the decorator form.</p>
                    </ConceptCard>

                    <ConceptCard title="Race: finish when the first command finishes">
                        <CodeBlock>{`Commands.race(
    intake.intakeCommand(),
    Commands.waitUntil(intake::hasPiece)
);`}</CodeBlock>
                        <p>
                            When the sensor wait finishes, the intake command is interrupted and its
                            cleanup runs. <code>a.raceWith(b)</code> is the decorator form.
                        </p>
                    </ConceptCard>

                    <ConceptCard title="Deadline: end with a designated command">
                        <CodeBlock>{`Commands.deadline(
    drivetrain.followPathCommand(path),
    arm.holdScorePositionCommand(),
    intake.keepPieceCommand()
);`}</CodeBlock>
                        <p>
                            The path is the deadline. When it ends, any other running members are
                            interrupted. Use deadline here so the other actions stop when the path finishes.
                        </p>
                    </ConceptCard>

                    <InfoBox>
                        <p>Use <strong>parallel</strong> when all work must
                            finish, <strong>race</strong> when any result is enough, and
                            <strong> deadline</strong> when the designated command finishes.</p>
                    </InfoBox>

                    <InfoBox>
                        <p><strong>Do not reuse a composed command object.</strong> After a command is
                            composed or decorated, use only the returned composition. Call the command
                            factory again for a fresh instance.</p>
                    </InfoBox>

                    <Challenge>
                        <p><strong>Practice:</strong> Deploy, wait for a piece, then stow. Add a two-second
                            timeout and return the intake to a safe state if canceled.</p>
                        <CodeBlock>{`public Command acquirePieceCommand() {
    // Your code
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`public Command acquirePieceCommand() {
    return runOnce(this::deploy)
        .andThen(Commands.waitUntil(this::hasPiece))
        .andThen(runOnce(this::stow))
        .withTimeout(2.0)
        .finallyDo(interrupted -> {
            stopRollers();
            setGoal(STOW_ANGLE);
        });
}`}</CodeBlock>
                        </Solution>
                    </Challenge>

                    <DocLink href="https://docs.wpilib.org/en/latest/docs/software/commandbased/commands-v2/command-compositions.html">
                        WPILib command composition documentation →
                    </DocLink>
                </Section>

                <Quiz
                    question="A path should run to completion while the arm moves and then holds position. When the path ends, the whole action should end. Which composition fits best?"
                    options={[
                        { text: "Sequence" },
                        { text: "Parallel" },
                        { text: "Race" },
                        { text: "Deadline, with the path as the deadline", correct: true },
                    ]}
                    explanation="The path defines the duration. The arm branch may finish its move earlier and continue holding until the deadline ends."
                />

                <Section id="ending" title="Finish Conditions, Timeouts, and Cleanup">
                    <p>
                        Default and hold-to-run commands may run until interrupted. Finite actions need
                        an end condition.
                    </p>

                    <ConceptCard title="until and waitUntil: finish from robot state">
                        <CodeBlock>{`arm.run(() -> arm.setGoal(target))
    .until(() -> arm.atGoal(target));

Commands.waitUntil(intake::hasPiece);`}</CodeBlock>
                    </ConceptCard>

                    <ConceptCard title="withTimeout: limit the duration">
                        <CodeBlock>{`intake.intakeUntilPieceCommand()
    .withTimeout(2.0);`}</CodeBlock>
                        <p>
                            A timeout is useful when a failed sensor would otherwise stall an autonomous
                            routine. Keep the piece-detection condition as well, so collection can finish as soon as the piece arrives.
                        </p>
                    </ConceptCard>

                    <ConceptCard title="onlyIf, unless, and either: choose at schedule time">
                        <CodeBlock>{`shooter.shootCommand()
    .onlyIf(shooter::atSpeed);

Commands.either(
    arm.moveToCommand(HIGH_SCORE),
    arm.moveToCommand(LOW_SCORE),
    operator::wantsHighScore
);`}</CodeBlock>
                    </ConceptCard>

                    <ConceptCard title="finallyDo: cleanup after success or interruption">
                        <CodeBlock>{`Commands.sequence(
    intake.deployCommand(),
    Commands.waitUntil(intake::hasPiece),
    intake.stowCommand()
).finallyDo(interrupted -> intake.stopRollers());`}</CodeBlock>
                        <p>
                            Put <code>stopRollers()</code> in the end callback or <code>finallyDo</code>. Canceling a sequence skips its remaining steps, including a final stow step.
                        </p>
                    </ConceptCard>

                    <ConceptCard title="repeatedly: restart a finite command until interrupted">
                        <CodeBlock>{`Commands.sequence(
    leds.setColorCommand(RED),
    Commands.waitSeconds(0.2),
    leds.setColorCommand(BLACK),
    Commands.waitSeconds(0.2)
).repeatedly();`}</CodeBlock>
                    </ConceptCard>
                </Section>

                <Section id="defaults" title="Default Commands">
                    <p>
                        A default command runs whenever its subsystem is free. When another command takes
                        that requirement, the default is interrupted. When the subsystem becomes free,
                        the scheduler starts the default again.
                    </p>

                    <CodeBlock>{`drivetrain.setDefaultCommand(
    drivetrain.run(() -> drivetrain.drive(
        -driver.getLeftY(),
        -driver.getLeftX(),
        -driver.getRightX()
    )).withName("Driver control")
);`}</CodeBlock>

                    <p>
                        The default command must require the subsystem. It should also be safe to restart
                        repeatedly. Drive control and maintaining a mechanism goal are common defaults;
                        one-time setup work is not.
                    </p>

                    <Hint>
                        Read joystick values inside the command lambda. Reading them before constructing
                        the command captures old values instead of updating every loop.
                    </Hint>
                </Section>

                <Section id="debugging" title="Debugging Commands">
                    <h3>Common traps</h3>
                    <ul>
                        <li><code>whileTrue(runOnce(...))</code> does not repeat the action while held.</li>
                        <li>A command that never finishes will block the next step of a sequence.</li>
                        <li>Creating and scheduling a new command every loop can repeatedly interrupt the previous command. Configure button bindings once in RobotContainer.</li>
                        <li>Reusing a command after adding it to a composition can crash the robot program.</li>
                    </ul>

                    <h3>When a command never starts</h3>
                    <ul>
                        <li>Confirm it is actually bound, scheduled, or used as a default.</li>
                        <li>Check whether a non-interruptible command already owns one of its requirements.</li>
                        <li>Make sure bindings were configured once during robot initialization.</li>
                    </ul>

                    <h3>When a command ends immediately</h3>
                    <ul>
                        <li>Check whether its finish condition is already true.</li>
                        <li>Remember that <code>runOnce</code> finishes immediately after its action.</li>
                        <li>Check whether a deadline or race partner ended first.</li>
                    </ul>

                    <h3>When a motor keeps running</h3>
                    <ul>
                        <li>Look for missing cleanup in <code>startEnd</code>, <code>runEnd</code>, or <code>finallyDo</code>.</li>
                        <li>Test both normal completion and cancellation.</li>
                        <li>Do not depend on the last step of a sequence to run after interruption.</li>
                    </ul>

                    <h3>Give commands useful names</h3>
                    <CodeBlock>{`driver.a().onTrue(
    intake.acquirePieceCommand().withName("Acquire piece")
);`}</CodeBlock>
                    <p>
                        Glass displays scheduled commands and subsystem ownership. A name such as “Acquire piece” lets you identify the running command in that display.
                    </p>
                    <DocLink href="https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/command-based-widgets.html">
                        WPILib command widgets in Glass →
                    </DocLink>
                </Section>

                <Section id="summary" title="Review Checklist">
                    <ol>
                        <li>What schedules it?</li>
                        <li>Which subsystems does it require?</li>
                        <li>What happens once, and what happens every loop?</li>
                        <li>What makes it finish?</li>
                        <li>What happens if it is interrupted halfway through?</li>
                        <li>Could a standard factory or composition express it more clearly?</li>
                    </ol>

                    <p>
                        Next, apply these patterns to the{" "}
                        <Link href="/students/intake" className={styles.externalLink}>
                            intake subsystem lesson
                        </Link>.
                    </p>
                </Section>

                <footer className={styles.footer}>
                    <Link href="/students" className={styles.backNav}>
                        <span>←</span> Back to Resources
                    </Link>
                </footer>
            </article>
        </main>
    );
}

function Section({
    id,
    title,
    children,
}: {
    id?: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={styles.sectionContent}>{children}</div>
        </section>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.hint}>
            <strong>Hint:</strong> {children}
        </div>
    );
}

function InfoBox({ children }: { children: React.ReactNode }) {
    return <div className={styles.infoBox}>{children}</div>;
}

function Challenge({ children }: { children: React.ReactNode }) {
    return <div className={styles.challenge}>{children}</div>;
}

function Solution({ children }: { children: React.ReactNode }) {
    return (
        <details className={styles.solution}>
            <summary className={styles.solutionToggle}>Show Solution</summary>
            <div className={styles.solutionContent}>{children}</div>
        </details>
    );
}

function ConceptCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.conceptCard}>
            <h3 className={styles.conceptTitle}>{title}</h3>
            <div className={styles.conceptContent}>{children}</div>
        </div>
    );
}

function DocLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.docLink}
        >
            {children}
        </a>
    );
}
