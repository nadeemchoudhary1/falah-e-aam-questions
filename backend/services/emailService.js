const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendSubmissionEmail(submissionData) {
    try {
      const htmlContent = this.generateHTMLEmail(submissionData);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `Quiz Submission: ${submissionData.personalDetails.fullName} - ${submissionData.userDetails.subject}`,
        html: htmlContent,
        text: this.generatePlainTextEmail(submissionData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send submission email');
    }
  }

  generateHTMLEmail(data) {
    const { personalDetails, userDetails, questionsAndAnswers, score } = data;
    const correctAnswers = questionsAndAnswers.filter(qa => qa.isCorrect).length;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .section { background: white; margin: 15px 0; padding: 15px; border-left: 4px solid #3498db; }
          .section h3 { margin-top: 0; color: #2c3e50; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #ecf0f1; font-weight: bold; }
          .correct { color: #27ae60; }
          .incorrect { color: #e74c3c; }
          .score-box { text-align: center; font-size: 24px; font-weight: bold; color: #2c3e50; margin: 20px 0; }
          .footer { text-align: center; color: #7f8c8d; margin-top: 30px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quiz Submission Report</h1>
            <p>${process.env.ADMIN_NAME}</p>
          </div>

          <div class="section">
            <h3>Student Information</h3>
            <table>
              <tr>
                <td><strong>Name:</strong></td>
                <td>${personalDetails.fullName}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>${userDetails.email}</td>
              </tr>
              <tr>
                <td><strong>Phone:</strong></td>
                <td>${personalDetails.phoneNumber}</td>
              </tr>
              <tr>
                <td><strong>Course:</strong></td>
                <td>${personalDetails.courseName}</td>
              </tr>
              <tr>
                <td><strong>Age:</strong></td>
                <td>${personalDetails.age}</td>
              </tr>
              <tr>
                <td><strong>Address:</strong></td>
                <td>${personalDetails.address}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h3>Quiz Details</h3>
            <table>
              <tr>
                <td><strong>Subject:</strong></td>
                <td>${userDetails.subject}</td>
              </tr>
              <tr>
                <td><strong>Total Questions:</strong></td>
                <td>${questionsAndAnswers.length}</td>
              </tr>
              <tr>
                <td><strong>Submission Date:</strong></td>
                <td>${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h3>Score</h3>
            <div class="score-box">
              ${correctAnswers} / ${questionsAndAnswers.length} (${score.percentage.toFixed(2)}%)
            </div>
          </div>

          <div class="section">
            <h3>Detailed Answers</h3>
            <table>
              <tr>
                <th>Q#</th>
                <th>Question</th>
                <th>Selected</th>
                <th>Correct</th>
                <th>Status</th>
              </tr>
              ${questionsAndAnswers.map((qa, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${qa.question}</td>
                  <td>${qa.selectedAnswer}</td>
                  <td>${qa.correctAnswer}</td>
                  <td class="${qa.isCorrect ? 'correct' : 'incorrect'}">
                    ${qa.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="footer">
            <p>This is an automated email. Please do not reply to this address.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePlainTextEmail(data) {
    const { personalDetails, userDetails, questionsAndAnswers, score } = data;
    const correctAnswers = questionsAndAnswers.filter(qa => qa.isCorrect).length;

    return `
Quiz Submission Report
${process.env.ADMIN_NAME}

STUDENT INFORMATION
Name: ${personalDetails.fullName}
Email: ${userDetails.email}
Phone: ${personalDetails.phoneNumber}
Course: ${personalDetails.courseName}
Age: ${personalDetails.age}
Address: ${personalDetails.address}

QUIZ DETAILS
Subject: ${userDetails.subject}
Total Questions: ${questionsAndAnswers.length}
Submission Date: ${new Date().toLocaleString()}

SCORE
${correctAnswers} / ${questionsAndAnswers.length} (${score.percentage.toFixed(2)}%)

ANSWER DETAILS
${questionsAndAnswers.map((qa, index) => 
  `Q${index + 1}: ${qa.question}\n  Selected: ${qa.selectedAnswer}\n  Correct: ${qa.correctAnswer}\n  Status: ${qa.isCorrect ? 'Correct' : 'Incorrect'}\n`
).join('')}

---
This is an automated email. Please do not reply to this address.
Generated on: ${new Date().toLocaleString()}
    `;
  }
}

module.exports = new EmailService();
