const { Resend } = require('resend');

// Initialize Resend Client with fallback/development safety
let resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

class EmailService {
  /**
   * Sends submission email via Resend HTTP API (Port 443)
   * Supports both sendSubmissionEmail(to, subject, htmlContent)
   * and sendSubmissionEmail(submissionData)
   */
  async sendSubmissionEmail(to, subject, htmlContent) {
    try {
      let recipient = to;
      let emailSubject = subject;
      let htmlBody = htmlContent;

      // Support direct submissionData object parameter
      if (typeof to === 'object' && to !== null && !subject) {
        const submissionData = to;
        recipient = process.env.ADMIN_EMAIL || 'onboarding@resend.dev';
        emailSubject = `Quiz Submission: ${submissionData.personalDetails?.fullName || 'Candidate'} - ${submissionData.userDetails?.subject || 'Examination'}`;
        htmlBody = this.generateHTMLEmail(submissionData);
      }

      // Development / Fallback mode if API key is not configured
      if (!process.env.RESEND_API_KEY) {
        console.warn('[EmailService] RESEND_API_KEY is not set. Email delivery skipped in development/fallback mode.');
        return { id: 'dev-mode-mock-email-id' };
      }

      if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
      }

      const response = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Exam Portal <onboarding@resend.dev>',
        to: recipient,
        subject: emailSubject,
        html: htmlBody
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Email sent successfully via Resend API:', response.data?.id || response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending email via Resend API:', error);
      throw error; // Propagate up to routing error catcher in api.js
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
            <p>${process.env.ADMIN_NAME || 'Falah e Aam Para Medical Institute'}</p>
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
                <td>${personalDetails.phoneNumber || 'Not provided'}</td>
              </tr>
              <tr>
                <td><strong>Course:</strong></td>
                <td>${personalDetails.courseName}</td>
              </tr>
              <tr>
                <td><strong>Address:</strong></td>
                <td>${personalDetails.address || 'Not provided'}</td>
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
            <p>This is an automated email sent via Resend HTTP API. Please do not reply to this address.</p>
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
${process.env.ADMIN_NAME || 'Falah e Aam Para Medical Institute'}

STUDENT INFORMATION
Name: ${personalDetails.fullName}
Email: ${userDetails.email}
Phone: ${personalDetails.phoneNumber || 'Not provided'}
Course: ${personalDetails.courseName}
Address: ${personalDetails.address || 'Not provided'}

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
This is an automated email sent via Resend HTTP API. Please do not reply to this address.
Generated on: ${new Date().toLocaleString()}
    `;
  }
}

module.exports = new EmailService();
