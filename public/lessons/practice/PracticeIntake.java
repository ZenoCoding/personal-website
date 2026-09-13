package frc.robot.subsystems;

import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

/** Laptop-only practice: no motor controller, no physics simulation.
 * Create ONE instance in RobotContainer. Build commands using these methods.
 * Commands must require this subsystem and stop the roller when they end.
 */
public class PracticeIntake extends SubsystemBase {
    private double rollerOutput = 0.0;

    public PracticeIntake() {
        SmartDashboard.putBoolean("Practice/HasPiece", false);
    }

    public void startRollers() { rollerOutput = 0.5; }
    public void reverseRollers() { rollerOutput = -0.5; }
    public void stopRollers() { rollerOutput = 0.0; }
    public boolean hasPiece() {
        return SmartDashboard.getBoolean("Practice/HasPiece", false);
    }

    @Override
    public void periodic() {
        SmartDashboard.putNumber("Practice/RollerOutput", rollerOutput);
    }
}
